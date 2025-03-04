// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
error IncorrectPrivilege();

contract TournoiPong 
{
    // Structure pour représenter un match
    address public owner;
    constructor() 
    {
        owner = msg.sender;
    }
    
    
    modifier onlyOwner() 
    {
        require(msg.sender == owner, "Owner privilege required");
        if(msg.sender != owner) 
        {
            revert IncorrectPrivilege;
        }
        _;
    }

    struct Game 
    {
        string p1;
        string p2;
        string winner; // Vainqueur du match
        uint8[2] score; // [score de player1, score de player2]

    }
    

    mapping(uint256 => Tournament) private tournaments;

    // Tableau pour stocker les résultats des matchs
    Game[] public matchs;

    // Événement pour notifier lorsqu'un match est enregistré
    event MatchEnregistre(
        string player1,
        string player2,
        uint8[2] scores,
        string winner
    );

    // Fonction pour enregistrer un match
    function enregistrerMatch(
        string memory _player1,
        string memory _player2,
        uint8 _scorePlayer1,
        uint8 _scorePlayer2,
        string memory _winner
    ) public {
        require(bytes(_player1).length > 0, "Nom du joueur 1 requis");
        require(bytes(_player2).length > 0, "Nom du joueur 2 requis");
        require(bytes(_winner).length > 0, "Nom du vainqueur requis");
        require(
            keccak256(abi.encodePacked(_winner)) == keccak256(abi.encodePacked(_player1)) ||
            keccak256(abi.encodePacked(_winner)) == keccak256(abi.encodePacked(_player2)),
            "Le vainqueur doit etre l'un des joueurs"
        );

        // Enregistrer le match dans le tableau
        matchs.push(Match({
            player1: _player1,
            player2: _player2,
            scores: [_scorePlayer1, _scorePlayer2],
            winner: _winner
        }));

        // Émettre un événement pour notifier de l'enregistrement du match
        emit MatchEnregistre(_player1, _player2, [_scorePlayer1, _scorePlayer2], _winner);
    }

    // Fonction pour récupérer les détails d'un match spécifique
    function getMatchDetails(uint256 index) public view returns (
        string memory player1,
        string memory player2,
        uint8[2] memory scores,
        string memory winner
    ) {
        require(index < matchs.length, "Index du match invalide");

        Match memory m = matchs[index];
        return (m.player1, m.player2, m.scores, m.winner);
    }

    // Fonction pour récupérer le nombre total de matchs enregistrés
    function getNombreDeMatchs() public view returns (uint256) {
        return matchs.length;
    }
}
