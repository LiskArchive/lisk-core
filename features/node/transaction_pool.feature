
Feature: Node transaction pool

	By specifying the state of the transaction, I get a list of unprocessed, unconfiremed and unsigned transactions.
	As a user I should be able to search for specific transactions by providing the appropriate parameters.

	Background: Client list
		Given I have list of clients
		Given The node is forging
		Given The network is moving

	Scenario Outline: Unprocessed, Unconfirmed and Unsigned transactions
		Given "thor" has a lisk account with balance 100 LSK tokens
		And I have minimum balance in my account for transaction "all"
			"""
			"fees": {
			"send": "10000000",
			"vote": "100000000",
			"secondSignature": "500000000",
			"delegate": "2500000000",
			"multisignature": "500000000",
			"dappRegistration": "2500000000"
			}
			"""
		When I send "all types" transaction to network
		And I request for transaction with "<params>"
		Then I should get list of transactions in Unprocessed, Unconfirmed and Unsigned state

		Examples:
			| params          |
			| id              |
			| recipientId     |
			| senderId        |
			| senderPublicKey |
			| type            |
			| limit           |
			| offset          |
			| sort            |
