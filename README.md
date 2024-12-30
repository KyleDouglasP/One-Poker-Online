# One Poker

[One Poker](http://one-poker-online.s3-website.us-east-2.amazonaws.com/) is a Web Application for playing One Poker from Kaiji.

![One Poker Screenshot](https://raw.githubusercontent.com/KyleDouglasP/One-Poker-Online/refs/heads/master/OnePoker.PNG)

This application supports two modes, playing against an AI opponent, or playing against a friend, by creating a lobby with a UUID lobby code.

## Implementation
Frontend implemented with React, deployed with AWS S3.

Backend implemented with Spring Boot, hosted with AWS EC2. Online mode was developed using Spring Boot WebSocket integration.

## Local Testing

If you'd like to make any changes and test locally:

1. cd into the frontend directory then run
```bash
npm start
```
2. cd into the backend directory then run
```bash
mvn spring-boot:run
```
You can now locally test any changes to the frontend or backend at [http://localhost:3000/](http://localhost:3000/)

## Contributing

Pull requests are welcome to the develop branch, master branch is the currently deployed version of the application. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
