Feature: List Transactions
  In order check transactions available in chain
  As a user
  I want to see list of transactions included in the blockchain

  Scenario: List transactions without params
    When I request for transactions without any params
    Then I should get list of 10 transactions sorted by field "height" and order "asc"

  Scenario Outline: List transactions with params
    When I request for transactions with "<params>"
    Then I should get transactions according to "<params>"

    Examples:
      | params                                                                              |
      | id=9912090348171005050                                                              |
      | recipientId=11237980039345381032L                                                   |
      | senderId=1276152240083265771L                                                       |
      | senderPublicKey=edf5786bef965f1836b8009e2c566463d62b6edd94e9cced49c1f098c972b92b    |
      | senderIdOrRecipientId=1276152240083265771L                                          |
      | height=1                                                                            |
      | minAmount=100000000                                                                 |
      | maxAmount=10000000000000000                                                         |
      | fromTimestamp=0                                                                     |
      | toTimestamp=81100864                                                                |
      | blockId=10620616195853047363                                                         |
      | limit=100                                                                           |
      | offset=0                                                                            |
      | sort=amount:asc                                                                     |
      | sort=amount:desc                                                                    |
      | sort=fee:asc                                                                        |
      | sort=fee:desc                                                                       |
      | sort=type:asc                                                                       |
      | sort=type:desc                                                                      |
      | sort=timestamp:asc                                                                  |
      | sort=timestamp:desc                                                                 |
