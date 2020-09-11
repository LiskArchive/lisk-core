.PHONY: build clean coldstart mrproper up
all: up

lisk_network := $(shell grep ^ENV_LISK_NETWORK= .env |tail -n 1 |awk -F = '{ print $$2 }')
ifeq ($(lisk_network),)
$(error .env file does not exist or ENV_LISK_NETWORK variable is not set.)
endif
ifeq ($(lisk_network),)
$(error .env file does not exist or ENV_LISK_DB_DATABASE variable is not set.)
endif

up:
	docker-compose up -d

compose := docker-compose -f docker-compose.yml -f docker-compose.make.yml
coldstart: up
	docker-compose stop lisk
ifeq ($(lisk_network),$(filter $(lisk_network),mainnet testnet betanet))
	$(compose) run --rm --entrypoint /home/lisk/coldstart.sh lisk-task $(lisk_network)
else
	# workaround for https://github.com/LiskHQ/lisk-sdk/issues/5798
	$(compose) run --rm --entrypoint /bin/rm lisk-task /home/lisk/.lisk/default/tmp/pids/controller.pid
	$(compose) run --rm lisk-task blockchain:reset --yes
endif
	docker-compose start lisk

LOGS_TAIL_LINES?=1000
LOGS_BUNYAN_OPTIONS=-o short
logs:
	docker logs --tail=$(LOGS_TAIL_LINES) --follow $$( docker-compose ps --quiet lisk ) |docker-compose exec -T lisk npx bunyan $(LOGS_BUNYAN_OPTIONS)

# for backwards compatibility
clean:
	true

mrproper:
	docker-compose down --volumes --remove-orphans


ifeq ($(CORE_VERSION),)
CORE_VERSION := $(shell jq --raw-output .version ../package.json )
endif
build:
	docker build --build-arg REGISTRY_URL=https://npm.lisk.io --build-arg NODEJS_VERSION=$(shell cat ../.nvmrc ) --build-arg CORE_VERSION=$(CORE_VERSION) -t=lisk/core:$(CORE_VERSION) .
