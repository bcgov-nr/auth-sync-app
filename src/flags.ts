import { Flags } from '@oclif/core';

export const help = {
  help: Flags.help({ char: 'h' }),
};

export const configPath = {
  'config-path': Flags.string({
    default: './config',
    description: 'The path to the config directory',
    env: 'AUTH_SYNC_CONFIG_PATH',
  }),
};

export const brokerApiUrl = {
  'broker-api-url': Flags.string({
    default: 'https://nr-broker.apps.silver.devops.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': Flags.string({
    required: false,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

// CSS Target
export const cssTokenUrlDefault = 'url';
export const cssTokenUrl = {
  'css-token-url': Flags.string({
    default: cssTokenUrlDefault,
    description: 'The css token url',
    env: 'CSS_TOKEN_URL',
  }),
};

export const cssClientIdDefault = 'id';
export const cssClientId = {
  'css-client-id': Flags.string({
    default: cssClientIdDefault,
    description: 'The css keycloak client id',
    env: 'CSS_CLIENT_ID',
  }),
};

export const cssClientSecretDefault = 'password';
export const cssClientSecret = {
  'css-client-secret': Flags.string({
    default: cssClientSecretDefault,
    description: 'The css keycloak client secret',
    env: 'CSS_CLIENT_SECRET',
  }),
};

// GitHub Target
export const githubClientTypeDefault = undefined;
export const githubClientType = {
  'github-client-type': Flags.string({
    default: githubClientTypeDefault,
    description: 'The GitHub client type',
    env: 'GITHUB_CLIENT_TYPE',
  }),
};

export const githubAppIdDefault = 'id';
export const githubAppId = {
  'github-app-id': Flags.string({
    default: githubAppIdDefault,
    description: 'The GitHub app id',
    env: 'GITHUB_APP_ID',
  }),
};

export const githubClientIdDefault = 'id';
export const githubClientId = {
  'github-client-id': Flags.string({
    default: githubClientIdDefault,
    description: 'The GitHub client id',
    env: 'GITHUB_CLIENT_ID',
  }),
};

export const githubClientSecretDefault = 'password';
export const githubClientSecret = {
  'github-client-secret': Flags.string({
    default: githubClientSecretDefault,
    description: 'The GitHub client secret',
    env: 'GITHUB_CLIENT_SECRET',
  }),
};

export const githubPrivateKeyDefault = 'key';
export const githubPrivateKey = {
  'github-private-key': Flags.string({
    default: githubPrivateKeyDefault,
    description: 'The GitHub private key for signing requests',
    env: 'GITHUB_PRIVATE_KEY',
  }),
};

export const githubTokenDefault = 'token';
export const githubToken = {
  'github-token': Flags.string({
    default: githubTokenDefault,
    description: 'A GitHub PAT',
    env: 'GITHUB_TOKEN',
  }),
};

export const targetFlags = {
  ...cssTokenUrl,
  ...cssClientId,
  ...cssClientSecret,
  ...githubClientType,
  ...githubAppId,
  ...githubClientId,
  ...githubClientSecret,
  ...githubPrivateKey,
  ...githubToken,
};

export const sourceBrokerIdp = {
  'source-broker-idp': Flags.string({
    default: '',
    description: 'The idp to filter users to',
    env: 'SOURCE_BROKER_DOMAIN',
  }),
};

export const notificationSmtpHost = {
  'notification-smtp-host': Flags.string({
    required: false,
    description: 'The SMTP Host',
    env: 'NOTIFICATION_SMTP_HOST',
  }),
};

export const notificationSmtpPort = {
  'notification-smtp-port': Flags.integer({
    required: false,
    description: 'The SMTP port',
    env: 'NOTIFICATION_SMTP_PORT',
  }),
};

export const notificationSmtpSecure = {
  'notification-smtp-secure': Flags.boolean({
    default: true,
    description: 'The SMTP secure flag',
    env: 'NOTIFICATION_SMTP_SECURE',
  }),
};

export const notificationOptionFrom = {
  'notification-option-from': Flags.string({
    required: false,
    description: 'The notification from address',
    env: 'NOTIFICATION_OPTION_FROM',
  }),
};

export const notificationOptionSubject = {
  'notification-option-subject': Flags.string({
    default: 'Your Access Report (<%= config.target.name %>)',
    description: 'The notification subject',
    env: 'NOTIFICATION_OPTION_SUBJECT',
  }),
};

export const notificationOptionTemplateText = {
  'notification-option-template-text': Flags.string({
    default: '',
    description: 'The notification template in text',
    env: 'NOTIFICATION_OPTION_TEMPLATE_TEXT',
  }),
};

export const notificationOptionTemplateHtml = {
  'notification-option-template-html': Flags.string({
    default: '',
    description: 'The notification template in html',
    env: 'NOTIFICATION_OPTION_TEMPLATE_HTML',
  }),
};
