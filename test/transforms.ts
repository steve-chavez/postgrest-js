import { PostgrestClient } from '../src/index'

import { AbortController } from 'node-abort-controller'

const postgrest = new PostgrestClient('http://localhost:3000')

test('order', async () => {
  const res = await postgrest.from('users').select().order('username', { ascending: false })
  expect(res).toMatchSnapshot()
})

test('order on multiple columns', async () => {
  const res = await postgrest
    .from('messages')
    .select()
    .order('channel_id', { ascending: false })
    .order('username', { ascending: false })
  expect(res).toMatchSnapshot()
})

test('limit', async () => {
  const res = await postgrest.from('users').select().limit(1)
  expect(res).toMatchSnapshot()
})

test('range', async () => {
  const res = await postgrest.from('users').select().range(1, 3)
  expect(res).toMatchSnapshot()
})

test('single', async () => {
  const res = await postgrest.from('users').select().limit(1).single()
  expect(res).toMatchSnapshot()
})

test('single on insert', async () => {
  const res = await postgrest.from('users').insert({ username: 'foo' }).single()
  expect(res).toMatchSnapshot()

  await postgrest.from('users').delete().eq('username', 'foo')
})

test('maybeSingle', async () => {
  const res = await postgrest.from('users').select().eq('username', 'goldstein').maybeSingle()
  expect(res).toMatchSnapshot()
})

test('select on insert', async () => {
  const res = await postgrest.from('users').insert({ username: 'foo' }).select('status')
  expect(res).toMatchSnapshot()

  await postgrest.from('users').delete().eq('username', 'foo')
})

test('select on rpc', async () => {
  const res = await postgrest
    .rpc('get_username_and_status', { name_param: 'supabot' })
    .select('status')
  expect(res).toMatchSnapshot()
})

test('csv', async () => {
  const res = await postgrest.from('users').select().csv()
  expect(res).toMatchInlineSnapshot(`
    Object {
      "body": "username,data,age_range,status,catchphrase
    supabot,,\\"[1,2)\\",ONLINE,\\"'cat' 'fat'\\"
    kiwicopple,,\\"[25,35)\\",OFFLINE,\\"'bat' 'cat'\\"
    awailas,,\\"[25,35)\\",ONLINE,\\"'bat' 'rat'\\"
    dragarcia,,\\"[20,30)\\",ONLINE,\\"'fat' 'rat'\\"",
      "count": null,
      "data": "username,data,age_range,status,catchphrase
    supabot,,\\"[1,2)\\",ONLINE,\\"'cat' 'fat'\\"
    kiwicopple,,\\"[25,35)\\",OFFLINE,\\"'bat' 'cat'\\"
    awailas,,\\"[25,35)\\",ONLINE,\\"'bat' 'rat'\\"
    dragarcia,,\\"[20,30)\\",ONLINE,\\"'fat' 'rat'\\"",
      "error": null,
      "status": 200,
      "statusText": "OK",
    }
  `)
})

test('abort signal', async () => {
  const ac = new AbortController()
  ac.abort()
  const res = await postgrest.from('users').select().abortSignal(ac.signal)
  expect(res).toMatchInlineSnapshot(`
    Object {
      "body": null,
      "count": null,
      "data": null,
      "error": Object {
        "code": "",
        "details": "",
        "hint": "",
        "message": "FetchError: The user aborted a request.",
      },
      "status": 400,
      "statusText": "Bad Request",
    }
  `)
})

test('geojson', async () => {
  const res = await postgrest
    .from('shops')
    .select()
    .geojson()
    .then((res) => res.data)
  expect(res).toMatchInlineSnapshot(`
    Object {
      "features": Array [
        Object {
          "geometry": Object {
            "coordinates": Array [
              -71.10044,
              42.373695,
            ],
            "type": "Point",
          },
          "properties": Object {
            "address": "1369 Cambridge St",
            "id": 1,
          },
          "type": "Feature",
        },
      ],
      "type": "FeatureCollection",
    }
  `)
})
