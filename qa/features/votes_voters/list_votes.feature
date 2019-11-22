Feature: List Votes
  In order check votes I casted to delegates
  As a delegate
  I want to see list of votes that I have casted

  Scenario Outline: List votes with params
    When I request for votes with "<params>"
    Then I should get votes according to "<params>"

    Examples:
      | params                                                                     |
      | address=11237980039345381032L                                              |
      | username=genesis_1                                                         |
      | publicKey=5c554d43301786aec29a09b13b485176e81d1532347a351aeafe018c199fd7ca |
      | sort=balance:asc&address=11237980039345381032L                             |
      | sort=balance:desc&address=11237980039345381032L                            |

