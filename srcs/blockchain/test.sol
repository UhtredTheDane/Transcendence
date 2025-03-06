pragma solidity ^0.8.20;

contract PongTournament {
    // Structure pour représenter un match
    struct Match {
        uint256 tournamentId; // ID du tournoi
        string player1;       // Nom du joueur 1
        string player2;       // Nom du joueur 2
        uint256 score1;       // Score du joueur 1
        uint256 score2;       // Score du joueur 2
    }

    // Structure pour représenter un tournoi
    struct Tournament {
        uint256 id;          // ID du tournoi
        string name;         // Nom du tournoi
        uint256 matchCount;  // Nombre de matchs dans le tournoi
    }

    // Variables d'état
    uint256 private tournamentCounter; // Compteur pour générer des IDs de tournoi
    mapping(uint256 => Tournament) public tournaments; // Stockage des tournois
    mapping(uint256 => Match[]) public tournamentMatches; // Stockage des matchs par tournoi

    // Événements
    event TournamentCreated(uint256 indexed tournamentId, string name);
    event MatchAdded(uint256 indexed tournamentId, string player1, string player2, uint256 score1, uint256 score2);

    // Créer un nouveau tournoi
    function createTournament(string memory _name) public {
        tournamentCounter++; // Incrémente le compteur de tournoi
        tournaments[tournamentCounter] = Tournament({
            id: tournamentCounter,
            name: _name,
            matchCount: 0
        });
        emit TournamentCreated(tournamentCounter, _name);
    }

    // Ajouter un match à un tournoi
    function addMatch(
        uint256 _tournamentId,
        string memory _player1,
        string memory _player2,
        uint256 _score1,
        uint256 _score2
    ) public {
        require(_tournamentId <= tournamentCounter, "Tournament does not exist"); // Vérifie que le tournoi existe
        tournamentMatches[_tournamentId].push(Match(
            {
            tournamentId: _tournamentId,
            player1: _player1,
            player2: _player2,
            score1: _score1,
            score2: _score2}));
        tournaments[_tournamentId].matchCount++; // Incrémente le nombre de matchs dans le tournoi
        emit MatchAdded(_tournamentId, _player1, _player2, _score1, _score2);
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
}