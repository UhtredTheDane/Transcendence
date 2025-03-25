// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PongTournament {
    struct Match {
        uint256 tournamentId;
        string player1;
        string player2;
        uint256 score1;
        uint256 score2;
        uint256 date; // Ajout du champ date dans la structure Match
    }

    // Structure pour représenter un tournoi
    struct Tournament {
        uint256 id;
        string name;
    }

    // Variables d'état
    uint256 private tournamentCounter; // Compteur pour générer des IDs de tournoi
    mapping(uint256 => Tournament) public tournaments; // Stockage des tournois
    mapping(uint256 => Match[]) public tournamentMatches; // Stockage des matchs par tournoi

    // Admin du contrat
    address public admin;
    bool private isInitialized = false;  // New flag to check if the contract has already been deployed

    // Événements
    event TournamentCreated(uint256 indexed tournamentId, string name);
    event MatchAdded(uint256 tournamentId, string player1, string player2, uint256 score1, uint256 score2, uint256 date);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    // Modificateur pour restreindre l'accès à l'admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // Constructeur : définit l'admin comme le déployeur du contrat
    constructor() {
        require(!isInitialized, "Contract has already been deployed!");
        admin = msg.sender;
        isInitialized = true;  // Mark contract as deployed
    }

    // Créer un nouveau tournoi (restreint à l'admin)
    function createTournament(string memory _name) public onlyAdmin {
        tournamentCounter++; // Incrémente le compteur de tournoi
        tournaments[tournamentCounter] = Tournament({
            id: tournamentCounter,
            name: _name
        });
        emit TournamentCreated(tournamentCounter, _name);
    }

    // Ajouter un match à un tournoi (restreint à l'admin)
    function addMatch(
        uint256 _tournamentId,
        string memory _player1,
        string memory _player2,
        uint256 _score1,
        uint256 _score2,
        uint256 _date // Ajout du paramètre date
    ) public onlyAdmin {
        require(_tournamentId <= tournamentCounter, "Tournament does not exist"); // Vérifie que le tournoi existe
        tournamentMatches[_tournamentId].push(Match({
            tournamentId: _tournamentId,
            player1: _player1,
            player2: _player2,
            score1: _score1,
            score2: _score2,
            date: _date // Stockage de la date dans le match
        }));
        emit MatchAdded(_tournamentId, _player1, _player2, _score1, _score2, _date); // Modification de l'événement pour inclure la date
    }

    // Récupérer les informations d'un tournoi
    function getTournament(uint256 _tournamentId) public view returns (Tournament memory) {
        require(_tournamentId <= tournamentCounter, "Tournament does not exist");
        return tournaments[_tournamentId];
    }

    // Récupérer les matchs d'un tournoi
    function getTournamentMatches(uint256 _tournamentId) public view returns (Match[] memory) {
        require(_tournamentId <= tournamentCounter, "Tournament does not exist");
        return tournamentMatches[_tournamentId];
    }

    // Récupérer le nombre total de tournois
    function getTournamentCount() public view returns (uint256) {
        return tournamentCounter;
    }

    // *** Nouvelle fonction : Récupérer les matchs d'un joueur spécifique dans un tournoi ***
    function getPlayerMatches(uint256 _tournamentId, string memory _playerName) public view returns (Match[] memory) {
        require(_tournamentId <= tournamentCounter, "Tournament does not exist");
        
        Match[] memory matches = tournamentMatches[_tournamentId];
        uint256 count = 0;

        // Compte les matchs joués par le joueur
        for (uint256 i = 0; i < matches.length; i++) {
            if (keccak256(bytes(matches[i].player1)) == keccak256(bytes(_playerName)) ||
                keccak256(bytes(matches[i].player2)) == keccak256(bytes(_playerName))) {
                count++;
            }
        }

        // Crée un tableau de taille appropriée pour stocker les matchs du joueur
        Match[] memory playerMatches = new Match[](count);
        uint256 index = 0;

        // Ajoute les matchs du joueur au nouveau tableau
        for (uint256 i = 0; i < matches.length; i++) {
            if (keccak256(bytes(matches[i].player1)) == keccak256(bytes(_playerName)) ||
                keccak256(bytes(matches[i].player2)) == keccak256(bytes(_playerName))) {
                playerMatches[index] = matches[i];
                index++;
            }
        }

        return playerMatches;
    }
}
