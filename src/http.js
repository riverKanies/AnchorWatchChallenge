import {getKey} from './Storage'

function apiBaseUrl () {
  return 'https://cybermonk.art'
}

async function getHeaders () {
  const jwt = await getKey("jwt")
  return {
      'Content-Type': 'application/json',
      'Authorization': jwt
  }
}


async function get (path) {
  const headers = await getHeaders()
  const raw = await fetch(apiBaseUrl()+path, {headers: headers})
  const res = await raw.json()
  return res
}

async function post (path, input) {
  const headers = await getHeaders()
  const raw = await fetch(apiBaseUrl()+path, {
      method: 'POST',
      body: JSON.stringify(input), 
      headers: headers
  })
  const res = await raw.json()
  return res
}

async function put (path, input) {
  const headers = await getHeaders()
  const raw = await fetch(apiBaseUrl()+path, {
      method: 'PUT',
      body: JSON.stringify(input), 
      headers: headers
  })
  const res = await raw.json()
  return res
}

async function del (path) {
  const headers = await getHeaders()
  const raw = await fetch(apiBaseUrl()+path, {
      method: 'DELETE',
      headers: headers
  })
  const res = await raw.json()
  return res
}

const http = {
  get,
  post,
  put,
  del
}

export default http