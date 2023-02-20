.PHONY: build

ifeq ($(CORE_VERSION),)
CORE_VERSION := $(shell jq --raw-output .version ../package.json )
endif
build:
	docker build --build-arg NODEJS_VERSION=$(shell cat ../.nvmrc ) -t=lisk/core:$(CORE_VERSION) ..
