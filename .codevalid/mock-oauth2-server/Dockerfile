FROM ghcr.io/navikt/mock-oauth2-server:6.0.0
# Bake config.json into the image — no bind mount (DinD §4.2)
COPY config.json /app/config.json
ENV JSON_CONFIG_PATH=/app/config.json
ENV SERVER_PORT=8080
