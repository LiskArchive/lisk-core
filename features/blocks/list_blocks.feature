Feature: List blocks
  In order to validate blockchain
  As a user
  I want to list blocks

  Background: Client list
    Given I have list of clients

  Scenario: List blocks without params
    Given The network is moving
    When I request for blocks without any params
    Then I should get "10" blocks
    And Blocks should be sorted by height in descending order by default

  Scenario Outline: List blocks with params
    Given The network is moving
    When I request for blocks with "<params>"
    Then I should get blocks according to params

    Examples:
      | params                                                                                                               |
      | blockId                                                                                                              |
      | height                                                                                                               |
      | limit                                                                                                                |
      | offset                                                                                                               |
      | generatorPublicKey                                                                                                   |
      | sort=height:asc,height:desc,totalAmount:asc,totalAmount:desc,totalFee:asc,totalFee:desc,timestamp:asc,timestamp:desc |
