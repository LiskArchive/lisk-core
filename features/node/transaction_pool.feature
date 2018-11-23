@smoke @fast
Feature: Node transaction pool

	By specifying the state of the transaction, I get a list of unprocessed, unconfiremed and unsigned transactions.
	As a user I should be able to search for specific transactions by providing the appropriate parameters.

	Scenario Outline: Create account
		Given I have list of clients
		Given The node is forging
		When "<user>" create a lisk account
		And has a balance "<amount>"LSK in the account
		Examples:
			| user    | amount |
			| jon     | 25     |
			| amar    | 25     |
			| akbar   | 25     |
			| anthony | 25     |

	Scenario: Unprocessed transactions
		Given I sent "100" transactions of different types to network
		When I request for transaction with parameters
			| params          |
			| id              |
			| recipientId     |
			| senderId        |
			| senderPublicKey |
			| type            |
			| limit           |
			| offset          |
			| sort            |
		Then I should get the unprocessed transaction

	Scenario: Unconfirmed transactions
		Given I sent "100" transactions of different types to network
		When I request for transaction with parameters
			| params          |
			| id              |
			| recipientId     |
			| senderId        |
			| senderPublicKey |
			| type            |
			| limit           |
			| offset          |
			| sort            |
		Then I should get the unconfiremed transaction

	Scenario: Unsigned transactions
		Given I sent "100" transactions of different types to network
		When I request for transaction with parameters
			| params          |
			| id              |
			| recipientId     |
			| senderId        |
			| senderPublicKey |
			| type            |
			| limit           |
			| offset          |
			| sort            |
		Then I should get the unconfiremed transaction
