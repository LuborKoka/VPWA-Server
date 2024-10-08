/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('statusChange', 'ActivityController.statusChange')



// this is dynamic namespace, in controller methods we can use params.name

Ws.namespace('channels/:name')
    // .middleware('channel') // check if user can join given channel
    .on('loadMessages', 'MessageController.loadMessages')
    .on('addMessage', 'MessageController.addMessage')
    .on('unsentMessage', 'MessageController.unsentMessage')
    .on('loadMembers', 'ChannelController.getMembers')
    .on('joinChannel', 'ChannelController.joinChannel')
    .on('createChannel', 'ChannelController.createChannel')
    .on('deleteChannel', 'ChannelController.deleteChannel')
    .on('quitChannel', 'ChannelController.quitChannel')
    .on('inviteToChannel', 'ChannelController.inviteToChannel')
    .on('revokeFromChannel', 'ChannelController.revokeFromChannel')
    .on('handleInvite', 'ChannelController.handleInvite')
