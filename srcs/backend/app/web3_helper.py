from web3 import Web3
import os
from django.conf import settings

# Connexion à Ethereum via HTTPProvider avec l'URL dans les variables d'environnement
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_PROVIDER_URL", "http://localhost:8545")))

# Vérification de la connexion à la blockchain
try:
    if w3.is_connected:  # Vérification de la connexion sans parenthèses
        print("Connecté à la blockchain!")
    else:
        print("Échec de la connexion à la blockchain!")
except Exception as e:
    print(f"Erreur de connexion: {e}")

# Charger l'ABI et l'adresse du contrat (remplacez par l'ABI de votre contrat)
abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "oldAdmin",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "AdminChanged",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "uint256",
          "name": "tournamentId",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "player1",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "player2",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "score1",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "score2",
          "type": "uint256"
        }
      ],
      "name": "MatchAdded",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "uint256",
          "name": "tournamentId",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "TournamentCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tournamentId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_player1",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_player2",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_score1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_score2",
          "type": "uint256"
        }
      ],
      "name": "addMatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "createTournament",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tournamentId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_playerName",
          "type": "string"
        }
      ],
      "name": "getPlayerMatches",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tournamentId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "player1",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "player2",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "score1",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "score2",
              "type": "uint256"
            }
          ],
          "internalType": "struct PongTournament.Match[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tournamentId",
          "type": "uint256"
        }
      ],
      "name": "getTournament",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "matchCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct PongTournament.Tournament",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTournamentCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tournamentId",
          "type": "uint256"
        }
      ],
      "name": "getTournamentMatches",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tournamentId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "player1",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "player2",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "score1",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "score2",
              "type": "uint256"
            }
          ],
          "internalType": "struct PongTournament.Match[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tournamentMatches",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tournamentId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "player1",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "player2",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "score1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "score2",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tournaments",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "matchCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]


contract = w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=abi)

def get_tournament_info(tournament_id):
    return contract.functions.getTournament(tournament_id).call()

def add_match(tournament_id, player1, player2, score1, score2):
    nonce = w3.eth.getTransactionCount(settings.WEB3_PROVIDER_URI)
    transaction = contract.functions.addMatch(
        tournament_id, player1, player2, score1, score2
    ).buildTransaction({
        'chainId': 1337,  # Utilisez 1337 pour Hardhat local
        'gas': 2000000,
        'gasPrice': w3.toWei('20', 'gwei'),
        'nonce': nonce,
    })

    # Signer la transaction
    signed_txn = w3.eth.account.signTransaction(transaction, private_key=settings.PRIVATE_KEY)

    # Envoyer la transaction
    tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
    return tx_hash.hex()
