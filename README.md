# Blurp

A Discord framework for Cloudflare Workers, Bun, Node, and Deno!

## Getting started

TODO: Add getting started

## Limitations

- Bun gateway doesn't work due to websockets error https://github.com/oven-sh/bun/issues/1592
- Deno Deploy doesn't work since it doesn't support npm specifiers yet https://github.com/denoland/deploy_feedback/issues/314

## Todo

- [ ] Docs
- [ ] Voice resuming
- [ ] Handle gateway heartbeat event
- [ ] Disconnect on no heartbeat ack
- [ ] VoiceConn events
- [ ] Node webhooks and gateway
- [ ] Starter templates
