import { inject, injectable, multiInject } from 'inversify';
import { getLogger } from '@oclif/core';

import { TYPES } from '../inversify.types';
import { SourceService, SourceUser } from '../services/source.service';
import { IntegrationConfig, RoleConfig, UserSummary } from '../types';
import { TargetService } from '../services/target.service';
import { SmtpNotificationService } from '../notification/smtp-notification.service';
import { roleFromConfig } from '../util/role.util';

type OutletMap = Map<string, Map<string, SourceUser>>;

@injectable()
/**
 * Css sync controller
 */
export class AuthMemberSyncController {
  private readonly console = getLogger('AuthMemberSyncController');
  /**
   * Constructor
   */
  constructor(
    @multiInject(TYPES.SourceService) private sourceServices: SourceService[],
    @inject(TYPES.TargetService) private targetService: TargetService,
    @inject(TYPES.SmtpNotificationService)
    private notificationService: SmtpNotificationService,
  ) {}

  public async sync(integrationConfigs: IntegrationConfig[]) {
    const sdate = new Date();
    const userMap: { [key in string]: OutletMap } = {};
    for (const integrationConfig of integrationConfigs) {
      const idp = integrationConfig.idp ?? 'idir';
      this.console.info(`>>> ${integrationConfig.name} : Get users`);
      userMap[integrationConfig.name] = await this.integrationMemberSync(
        idp,
        integrationConfig.roles,
      );

      for (const environment of integrationConfig.environments) {
        const sEnvDate = new Date();
        this.console.info(
          `>>> ${integrationConfig.name} - ${environment}: start`,
        );
        const summaryMap = await this.syncIntegrationRoleUsers(
          integrationConfig,
          environment,
          userMap[integrationConfig.name],
          idp,
        );

        if (
          integrationConfig.notifyEnvironments &&
          integrationConfig.notifyEnvironments.indexOf(environment) !== -1
        ) {
          this.notificationService.notifyUsers(integrationConfig, [
            ...summaryMap.values(),
          ]);
        }

        const eEnvDate = new Date();
        this.console.info(
          `>>> ${integrationConfig.name} - ${environment}: done - ${eEnvDate.getTime() - sEnvDate.getTime()} ms`,
        );
      }
    }
    const edate = new Date();

    this.console.info(`Done - ${edate.getTime() - sdate.getTime()} ms`);
  }

  private async syncIntegrationRoleUsers(
    integrationConfig: IntegrationConfig,
    environment: string,
    userRoles: OutletMap,
    idp: string,
  ) {
    const userSummary = new Map<string, UserSummary>();
    for (const [roleName, roleUserGuidMap] of userRoles.entries()) {
      this.console.info(`${integrationConfig.id} ${environment} ${roleName}`);
      const existingUserGuidMap = await this.targetService.getRoleUsers(
        integrationConfig.id,
        environment,
        idp,
        roleName,
      );

      const usersToRemove = [...existingUserGuidMap.keys()]
        .filter((guid) => !roleUserGuidMap.has(guid))
        .map((guid) => existingUserGuidMap.get(guid))
        .filter((user) => !!user);
      const usersToAdd = [...roleUserGuidMap.keys()]
        .filter((guid) => !existingUserGuidMap.has(guid))
        .map((guid) => roleUserGuidMap.get(guid))
        .filter((user) => !!user);
      // this.console.info(`remove:`);
      // this.console.info(usersToRemove);
      // this.console.info(`add:`);
      // this.console.info(usersToAdd);
      const [finalizedAdd, finalizedDel] = await Promise.all([
        this.targetService.alterIntegrationRoleUser(
          integrationConfig,
          environment,
          roleName,
          'add',
          usersToAdd,
        ),
        this.targetService.alterIntegrationRoleUser(
          integrationConfig,
          environment,
          roleName,
          'del',
          usersToRemove,
        ),
      ]);
      for (const finalize of finalizedAdd) {
        if (!userSummary.has(finalize.guid)) {
          userSummary.set(finalize.guid, new UserSummary(finalize));
        }
        userSummary.get(finalize.guid)?.addRoles.push(roleName);
      }
      for (const finalize of finalizedDel) {
        if (!userSummary.has(finalize.guid)) {
          userSummary.set(finalize.guid, new UserSummary(finalize));
        }
        userSummary.get(finalize.guid)?.delRoles.push(roleName);
      }
    }
    return userSummary;
  }

  private async integrationMemberSync(idp: string, roleConfigs: RoleConfig[]) {
    const roleConfigNames = roleConfigs.map((roleConfig) =>
      roleFromConfig(roleConfig),
    );

    const outletMap = await this.addUserToRoleWithServices(roleConfigs);
    // Copy members from other roles (does not recursively copy)
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'copy',
      (
        role: string,
        outletMap: OutletMap,
        targetSet: Map<string, SourceUser>,
      ) => {
        if (!outletMap.has(role)) {
          outletMap.set(role, new Map<string, SourceUser>());
        }
        for (const user of targetSet.entries()) {
          outletMap.get(role)?.set(...user);
        }
      },
    );

    // Exclude members if in other roles -- useful if being in both is a problem
    this.manipulateUsersInOutlet(
      roleConfigs,
      roleConfigNames,
      outletMap,
      'exclude',
      (
        role: string,
        outletMap: OutletMap,
        targetSet: Map<string, SourceUser>,
      ) => {
        if (!outletMap.has(role)) {
          return;
        }
        for (const user of targetSet.keys()) {
          outletMap.get(role)?.delete(user);
        }
      },
    );
    return outletMap;
  }

  private manipulateUsersInOutlet(
    roleConfigs: RoleConfig[],
    roleConfigNames: string[],
    outletMap: OutletMap,
    key: string,
    callback: any,
  ) {
    for (const roleConfig of roleConfigs) {
      if (!(roleConfig as any).members?.[key]) {
        continue;
      }
      const targetVal: any = (roleConfig as any).members[key];
      const targetArr = new Set<string>();

      for (const target of targetVal) {
        if (target.startsWith('/') && target.endsWith('/')) {
          const re = new RegExp(target.slice(1, -1));
          roleConfigNames
            .filter((roleName: string) => re.test(roleName))
            .forEach((roleName: string) => targetArr.add(roleName));
        } else {
          targetArr.add(target);
        }
      }

      for (const target of targetArr.values()) {
        if (!outletMap.has(target)) {
          continue;
        }
        callback(roleFromConfig(roleConfig), outletMap, outletMap.get(target));
      }
    }
  }

  private async addUserToRoleWithServices(roleConfigs: RoleConfig[]) {
    const outletMap = new Map<string, Map<string, SourceUser>>();
    for (const roleConfig of roleConfigs) {
      const role = roleFromConfig(roleConfig);
      const users = await this.getUserMapFromServices(roleConfig);
      if (users.size > 0) {
        outletMap.set(role, users);
      }
    }
    return outletMap;
  }

  private async getUserMapFromServices(roleConfig: RoleConfig) {
    const userMap = new Map<string, SourceUser>();
    for (const sourceService of this.sourceServices) {
      const users = await sourceService.getUsers(roleConfig.members);
      users.forEach((user) => userMap.set(user.guid, user));
    }
    return userMap;
  }
}
