export AUTH_SYNC_CONFIG_PATH=./config
export BROKER_TOKEN=
export SOURCE_BROKER_DOMAIN=azureidir
export CSS_TOKEN_URL=$(jq -r '.tokenUrl' $AUTH_SYNC_CONFIG_PATH/service-account.json)
export CSS_CLIENT_ID=$(jq -r '.clientId' $AUTH_SYNC_CONFIG_PATH/service-account.json)
export CSS_CLIENT_SECRET=$(jq -r '.clientSecret' $AUTH_SYNC_CONFIG_PATH/service-account.json)
