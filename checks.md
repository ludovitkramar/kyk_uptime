Ludovit-ArchVM% curl -I https://kykvit.com/music/
HTTP/2 200
server: nginx/1.18.0
date: Mon, 13 Dec 2021 09:32:50 GMT
content-type: text/html
content-length: 10498
last-modified: Fri, 10 Dec 2021 16:09:01 GMT
etag: "61b37b9d-2902"
accept-ranges: bytes

Ludovit-ArchVM% curl -I https://matrix.kykvit.com/_matrix/federation/       
HTTP/2 400
server: nginx/1.18.0
date: Mon, 13 Dec 2021 09:33:14 GMT
content-type: application/json
cache-control: no-cache, no-store, must-revalidate
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD, POST, PUT, DELETE, OPTIONS
access-control-allow-headers: X-Requested-With, Content-Type, Authorization, Date

Ludovit-ArchVM% curl -I https://nc.kykvit.com/index.php/login
HTTP/2 200
server: nginx/1.18.0
date: Mon, 13 Dec 2021 09:33:47 GMT
content-type: text/html; charset=UTF-8
content-length: 11600
vary: Accept-Encoding
expires: Thu, 19 Nov 1981 08:52:00 GMT
pragma: no-cache
cache-control: no-cache, no-store, must-revalidate
content-security-policy: default-src 'none';base-uri 'none';manifest-src 'self';script-src 'self' blob:;style-src 'self' 'unsafe-inline';img-src 'self' data: blob: https://*.tile.openstreetmap.org;font-src 'self' data:;connect-src 'self' blob: stun.nextcloud.com:443;media-src 'self' blob:;frame-src 'self';child-src blob: 'self';frame-ancestors 'self';worker-src 'self' blob:;form-action 'self'
feature-policy: autoplay 'self';camera 'self';fullscreen 'self';geolocation 'self';microphone 'self';payment 'none'
x-robots-tag: none
set-cookie: oc_sessionPassphrase=wy5nK9Sn5dx2Ab31mrljs1DW%2BydBvVvkrMsngKlFaEWICn5Pauf9eQMEodvaF8KVhCMDDfDHmoNZPy%2FmVpu4k8JCEekcN6iSRNWtIJ3WBJ6FFbNor478QNf7Gy%2Bs%2B7XR; path=/; secure; HttpOnly; SameSite=Lax
set-cookie: oc5b4qz1xpjz=794dqi5nq6e2j5qek4b71oq9h2; path=/; secure; HttpOnly; SameSite=Lax
set-cookie: __Host-nc_sameSiteCookielax=true; path=/; httponly;secure; expires=Fri, 31-Dec-2100 23:59:59 GMT; SameSite=lax
set-cookie: __Host-nc_sameSiteCookiestrict=true; path=/; httponly;secure; expires=Fri, 31-Dec-2100 23:59:59 GMT; SameSite=strict
referrer-policy: no-referrer
x-content-type-options: nosniff
x-download-options: noopen
x-frame-options: SAMEORIGIN
x-permitted-cross-domain-policies: none
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains