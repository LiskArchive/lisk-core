
# Lisk Core QA
Quality Assurance of Lisk Network.

The quality assurance ensures if the release candidates are

- **Functional**
    - Features supported by Lisk Protocol such as accounts, delegates, voting, multisignature and dapp creation

- **Efficient**
    - Stress test are performed agianst the network with every transaction type ensures the network is stable and reliable under heavy load, it also determines the throughput consistancy.

- **Improved**
    - Newly introduced features for a particular release to be covered with new feature scenarios.

- QA Release
  - For every release run through this checklist [scenarios](docs/qa_round_template.md).

## Tools

### Peers
- `NETWORK=alphanet npm run tools:peers:list`

	List all the peers from the network.

- `NETWORK=alphanet npm run tools:peers:config`

	List all the peers from the network and write it network config file.

### Delegates
Before running enable or disable, run peers config `npm run tools:peers:config`

- `NETWORK=alphanet npm run tools:delegates:enable`

	Enable delegates for a given network.

	Default network is `development` [fixtures/config.json](fixtures/config.json)

- `NETWORK=alphanet npm run tools:delegates:disable`

	Disable delegates for a given network.

	Default network is `development` [fixtures/config.json](fixtures/config.json)

### Stress testing

- `NETWORK=alphanet STRESS_COUNT=1000 npm run stress`

### Lisk protocol feature testing
- `NETWORK=alphanet npm run features`
