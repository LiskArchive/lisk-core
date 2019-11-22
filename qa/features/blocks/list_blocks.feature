Feature: List blocks
  In order to validate blockchain
  As a user
  I want to list blocks

  Scenario: List blocks without params
    When I request for blocks without any params
    Then I should get list of blocks sorted by "height" in "desc" order

  Scenario Outline: List blocks with params
    When I request for blocks with "<params>"
    Then I should get blocks according to "<params>"

    Examples:
      | params                                                                              |
      | blockId=10620616195853047363                                                         |
      | height=1                                                                            |
      | limit=2                                                                             |
      | offset=2                                                                            |
      | generatorPublicKey=1d4677e06f870449f271f859e299e3514718e4b8498c1bd832daa7843b83d9c5 |
      | sort=height:asc                                                                     |
      | sort=height:desc                                                                    |
      | sort=totalAmount:asc                                                                |
      | sort=totalAmount:desc                                                               |
      | sort=totalFee:asc                                                                   |
      | sort=totalFee:desc                                                                  |
      | sort=timestamp:asc                                                                  |
      | sort=timestamp:desc                                                                 |
