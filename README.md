# setup and run
## Local testing
### Testing
- 1 Enterprise account
- 1 extra account
- Someone to upgrade app from member to org
### Cloudflare tunnel
- Install cloudflare tunnel from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
- Run `cloudflared tunnel --url http://localhost:3000`


### Org App
I was lucky enough to have an account that was org account
#### User
- create a member app -> https://staging.hootsuite.com/developers/my-apps
- enter your nam of the app and webhook url
- click ping, to make sure your app is receiving messages from the webhook
  - resp: `[ { type: 'com.hootsuite.ping.event.v1', data: {} } ]`
#### Organization
- go to https://hootsuite.com/admin/app-directory/apps
- find the app, click edit
- change app type to `org app`
- save
- Generate API client id / secret
- save
- Currently ORG type apps can only be installed to an organization from admin tools. To access this UI, you need to be a Hootsuite admin with the MANAGE_ORGANIZATION_SETUP permission.

- Go to https://hootsuite.com/admin/org-setup-apps and search for the organization name:
- click on: `Look up org apps for this org`
- Add app, the user needs to be a non payment user in the org




Webhooks: 
Site: https://developer.hootsuite.com/docs/webhooks-overview

[ ] [Ping](https://developer.hootsuite.com/docs/webhooks#ping)
  - All Accounts
  - type: `com.hootsuite.ping.event.v1`
  - sample data: `{ } `
[ ] [Message](https://developer.hootsuite.com/docs/webhooks#message)
  - Org Enterprise app
  - type: `com.hootsuite.messages.event.v1`
  - sample data:
  ```json
  {
    seq_no: '1684272788542',
    type: 'com.hootsuite.messages.event.v1',
    data: {
      state: 'PENDING_APPROVAL',
      organization: [Object],
      message: [Object],
      timestamp: '2023-05-17T15:35:25.555Z'
    }
  }```

  