FROM ghcr.io/shopify/toxiproxy:2.12.0
# Base is FROM scratch — add static busybox for healthcheck HTTP probe (§5.1a)
COPY --from=busybox:1.38-musl /bin/busybox /bin/busybox
COPY toxiproxy.json /config/toxiproxy.json
