.PHONY: all clean release

EXPECTED_NODEJS_VERSION := $(shell cat .nvmrc)
RUNNING_NODEJS_VERSION := $(shell node --version)
ifneq ($(RUNNING_NODEJS_VERSION),v$(EXPECTED_NODEJS_VERSION))
$(error Wrong Node.js version: $(RUNNING_NODEJS_VERSION) (expected: v$(EXPECTED_NODEJS_VERSION)))
endif

CORE_VERSION := $(shell jq --raw-output .version package.json)
ifneq ($(findstring alpha,$(CORE_VERSION)),)
CORE_CHANNEL := alpha
else ifneq ($(findstring beta,$(CORE_VERSION)),)
CORE_CHANNEL := beta
else ifneq ($(findstring rc,$(CORE_VERSION)),)
CORE_CHANNEL := rc
else ifneq ($(findstring canary,$(CORE_VERSION)),)
CORE_CHANNEL := canary
endif

all: node_modules dist/index.js release

clean:
	rm -rf dist/ node_modules/

package-lock.json:
	git checkout package-lock.json
	touch -r npm-shrinkwrap.json package-lock.json

npm-shrinkwrap.json: package-lock.json
	cp -f package-lock.json npm-shrinkwrap.json

node_modules: npm-shrinkwrap.json
	npm ci

dist/index.js: node_modules
	npm run build

ifndef $(CORE_VERSION)
release: dist/channels/$(CORE_CHANNEL)/lisk-core-v$(CORE_VERSION)

dist/channels/$(CORE_CHANNEL)/lisk-core-v$(CORE_VERSION):
	npx oclif-dev pack --targets=linux-x64,darwin-x64
else
release: dist/lisk-core-v$(CORE_VERSION)

dist/lisk-core-v$(CORE_VERSION):
	npx oclif-dev pack --targets=linux-x64,darwin-x64
endif
