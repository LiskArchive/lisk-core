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
      | id=3634383815892709956                                                              |
      | recipientId=16313739661670634666L                                                   |
      | recipientPublicKey=c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f |
      | senderId=1085993630748340485L                                                       |
      | senderPublicKey=c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8    |
      | senderIdOrRecipientId=1085993630748340485L                                          |
      | type=0                                                                              |
      | height=1                                                                            |
      | minAmount=100000000                                                                 |
      | maxAmount=10000000000000000                                                         |
      | fromTimestamp=0                                                                     |
      | toTimestamp=81100864                                                                |
      | blockId=6524861224470851795                                                         |
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
