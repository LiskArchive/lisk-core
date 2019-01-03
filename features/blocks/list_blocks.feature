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
      | blockId=6524861224470851795                                                         |
      | height=1                                                                            |
      | limit=2                                                                             |
      | offset=2                                                                            |
      | generatorPublicKey=c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8 |
      | sort=height:asc                                                                     |
      | sort=height:desc                                                                    |
      | sort=totalAmount:asc                                                                |
      | sort=totalAmount:desc                                                               |
      | sort=totalFee:asc                                                                   |
      | sort=totalFee:desc                                                                  |
      | sort=timestamp:asc                                                                  |
      | sort=timestamp:desc                                                                 |
