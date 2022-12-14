import { createClient } from 'urql'
import { createClient as createWsClient } from 'graphql-ws'

import constants from './constants'
import getAuthToken from './getAuthToken'
import createStore from './createStore'
import initiateAuth from './initiateAuth'

const noToken =
  'eyJhbGciOiJIUzUxMiIsImtpZCI6IjRlMjdmNWIwNjllYWQ4ZjliZWYxZDE0Y2M2Mjc5YmRmYWYzNGM1MWIiLCJ0eXAiOiJKV1QifQ.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6Im5vbmUiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbIm5vbmUiXSwieC1oYXN1cmEtdXNlci1pZCI6ImFhYWFhYWFhLWFhYWEtMTFlYS1hYWFhLWFhYWFhYWFhYWFhYSJ9LCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdmVybWVocnVuZy1hYWFhYSIsImF1ZCI6InZlcm1laHJ1bmctZjQ4YzQiLCJhdXRoX3RpbWUiOjE1OTE5Njg3MzQsInVzZXJfaWQiOiJYUnV6eHAxWDJ3YWFhYWF5ek9hV1Y2emdhYWFhIiwic3ViIjoiWFJ1enhwMVhhYWFhb3l6T2FXVjZ6Z0NDTDIiLCJpYXQiOjE1OTE5NjkzNDksImV4cCI6MTU5MTk3Mjk0OSwiZW1haWwiOiJ0ZXN0QHRlc3QuY2giLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEB0ZXN0LmNoIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0._BWw-QO7K_oTr72pHZBl4OlXox3_x59IGEnllj3PwaFO8fylhQX7YZyaNev7iqeiyzx2DRZyAQyFhffNjEWyog'
const getToken = () => window.localStorage.getItem('token') ?? noToken

const initiateApp = async () => {
  const store = await createStore()
  // ws client only works in the browser
  // need to prevent gatsby from executing it server side
  // see: https://github.com/apollographql/subscriptions-transport-ws/issues/333#issuecomment-359261024gqlWsClient
  let token
  // enable gracefull restart: https://github.com/enisdenjo/graphql-ws#graceful-restart
  const createRestartableClient = (options) => {
    let restartRequested = false
    let restart = () => {
      restartRequested = true
    }

    const client = createWsClient({
      ...options,
      on: {
        ...options.on,
        opened: (socket) => {
          options.on?.opened?.(socket) 

          restart = () => {
            if (socket.readyState === WebSocket.OPEN) {
              // if the socket is still open for the restart, do the restart
              socket.close(4205, 'Client Restart')
            } else {
              // otherwise the socket might've closed, indicate that you want
              // a restart on the next opened event
              restartRequested = true
            }
          }

          // just in case you were eager to restart
          if (restartRequested) {
            restartRequested = false
            restart()
          }
        },
        closed: () => {
          console.log('ws client disconnected')
          //store.setShortTermOnline(false)
          //store.incrementWsReconnectCount()
          window.location.reload(true)
        },
        connected: () => {
          console.log('ws client connected')
          store.setShortTermOnline(true)
        },
      },
    })

    return {
      ...client,
      restart: () => restart(),
    }
  }

  const gqlWsClient = (() => {
    token = getToken()

    return createRestartableClient({
      url: constants?.getGraphQlWsUri(),
      connectionParams: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
      onNonLazyError: async (error) => {
        console.log('gqlWsClient connectionCallback error:', error)
        if (error.toLowerCase().includes('jwt')) {
          await getAuthToken({ store })
          token = getToken()
          window.location.reload(true)
        }
      },
    })
  })()
  // console.log('initiateApp, setting gqlWsClient:', gqlWsClient)
  store.setGqlWsClient(gqlWsClient)

  // need to renew header any time
  // solutions:
  // https://github.com/apollographql/subscriptions-transport-ws/issues/171#issuecomment-307793837

  const gqlClient = createClient({
    url: constants?.getGraphQlUri(),
    fetchOptions: () => {
      const token = getToken()
      return {
        headers: { authorization: token ? `Bearer ${token}` : '' },
      }
    },
  })
  // console.log('initiateApp, setting gqlClient:', gqlClient)
  store.setGqlClient(gqlClient)

  const unregisterAuthObserver = await initiateAuth({ store })
  const unregister = () => {
    // cleanup()
    unregisterAuthObserver?.()
    gqlWsClient.dispose()
  }

  // console.log('initiateApp, store:', store)
  return { store, unregister }
}

export default initiateApp
