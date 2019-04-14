
Feature: Node transaction pool

	By specifying the state of the transaction, I get a list of unprocessed, unconfiremed and unsigned transactions.
	As a user I should be able to search for specific transactions by providing the appropriate parameters.

	Scenario: Unprocessed, Unconfirmed transactions
		Given "thor" has a lisk account with balance 100 LSK tokens
		When "thor" send 1 LSK token to 15 random accounts
		Then I should get list of transactions in "unprocessed", "unconfirmed" queue

	Scenario: Unsigned transactions
		Given "heimdall" has a lisk account with balance 100 LSK tokens
		And "heimdall" creates a multisignature account with "thor", "odin"
		When "heimdall" sends 1 LSK token to a random account
		Then I should get list of transactions in "unsigned" queue
		When "thor" and "odin" sends the required signature
		Then multisignature transaction should get confirmed
