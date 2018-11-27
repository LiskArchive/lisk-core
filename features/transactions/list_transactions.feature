Feature: List Transactions
  In order check transactions available in chain
  As a user
  I want to see list of transactions included in the blockchain

  Background: Client list
    Given I have list of clients

  Scenario: List transactions without params
    Given The network is moving
    When I request for transactions without any params
    Then I should get list of "10" transactions sorted by "height:asc"

  Scenario Outline: List transactions with params
    Given The network is moving
    When I request for transactions with "<params>"
    Then I should get transactions according to params

    Examples:
      | params                                                                                              |
      | id                                                                                                  |
      | recipientId                                                                                         |
      | recipientPublicKey                                                                                  |
      | senderId                                                                                            |
      | senderPublicKey                                                                                     |
      | senderIdOrRecipientId                                                                               |
      | type                                                                                                |
      | height                                                                                              |
      | minAmount                                                                                           |
      | maxAmount                                                                                           |
      | fromTimestamp                                                                                       |
      | toTimestamp                                                                                         |
      | blockId                                                                                             |
      | limit                                                                                               |
      | offset                                                                                              |
      | sort=amount:asc, amount:desc, fee:asc, fee:desc, type:asc, type:desc, timestamp:asc, timestamp:desc |
