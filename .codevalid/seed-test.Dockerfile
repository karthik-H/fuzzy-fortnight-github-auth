FROM debian:bookworm-slim
ARG CACHEBUST=20260807a
RUN echo "cachebust=${CACHEBUST}" \
    && apt-get update && apt-get install -y --no-install-recommends \
        curl \
        jq \
        ca-certificates \
        bash \
        python3 \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

COPY mysql_wrapper.sh /usr/local/bin/mysql
RUN chmod +x /usr/local/bin/mysql

WORKDIR /work
COPY seed_test_cases ./seed_test_cases
COPY tests ./tests
