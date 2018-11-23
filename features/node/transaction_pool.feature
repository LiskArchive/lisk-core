@smoke @fast
Feature: Node transaction pool

	By specifying the state of the transaction, I get a list of unprocessed, unconfiremed and unsigned transactions.
	As a user I should be able to search for specific transactions by providing the appropriate parameters.

	Scenario Outline: Create account
		Given The node is running
		When "<user>" create a lisk account
		Then has a balance "<balance>"LSK in the account
		Examples:
			| user    | balance |
			| jon     | 25      |
			| amar    | 25      |
			| akbar   | 25      |
			| anthony | 25      |

	Scenario: Unprocessed transactions
		Given I have
		When I request for node status
		Then I should get node status
