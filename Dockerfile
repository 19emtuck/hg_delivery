FROM python:3.8-slim-buster

# RUN addgroup -g 1001 app
# RUN adduser -u 1001 -S -D -G app -s /usr/sbin/nologin app

WORKDIR /app

RUN set -ex; \
	apt-get update; \
	apt-get install -y redis-server redis-tools

RUN set -ex; \
	pip install --upgrade pip;

COPY .  /app/
RUN chmod +x /app/entrypoint.sh
RUN python ./setup.py develop
RUN initialize_hg_delivery_db  /app/production.ini

# run as non priviledged user
# USER app

EXPOSE 6543
CMD ["/app/entrypoint.sh"]
