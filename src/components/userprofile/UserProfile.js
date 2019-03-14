import React from "react";
import styled from "styled-components";
import { BaseContainer } from "../../helpers/layout";
import { getDomain } from "../../helpers/getDomain";
import { withRouter } from "react-router-dom";
import { Button } from "../../views/design/Button";
import Player from "../../views/Player";


const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Container = styled(BaseContainer)`
  color: white;
  text-align: center;
`;

const TextField = styled.div`
  display: flex;
  justify-content: center;
`;

const PlayerContainer = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const InputField = styled.input`
  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
  height: 35px;
  padding-left: 15px;
  margin-left: -4px;
  border: none;
  border-radius: 20px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
`;
const Label = styled.label`
  color: white;
  margin-bottom: 10px;
`;


class UserProfile extends React.Component{
    constructor() {
        super();
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleBirthdayChange = this.handleBirthdayChange.bind(this);
        this.state = {
            username: null,
            oldusername: null,
            status: null,
            creationdate: null,
            birthdate: "TBD",
            oldbirthday: null,
            changemode: false,
            editable:false,

        };
    }

    handleNameChange(event){
        this.setState({username: event.target.value});
    }

    handleBirthdayChange(event){
        this.setState({birthdate: event.target.value});
    }

    redirectToDashboard(){
        this.props.history.push("/game");
    }

    componentDidMount() {
        fetch(`${getDomain()}/users/${window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(response => {
                if(response.status !== 404){
                    this.setState({
                        username: response.username,
                        oldusername: response.username,
                        status: response.status,
                        password: response.password,
                        creationdate: response.creationdate,
                        birthdate: response.birthday,
                        oldbirthday: response.birthday,
                        token: response.token,
                        editText:"",
                        editButtonText: "Edit",
                    });
                }
            })
            .catch(err =>{
                if(err.message.match(/Failed to fetch/)){
                    alert("The server cannot be reached. Did you start it?");
                } else {
                    alert(`Something went wrong during the login: ${err.message}`);
                }
            });
    }

    applyChanges(){
        fetch(`${getDomain()}/users/${window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                birthday: this.state.birthdate,
                token: this.state.token
            })
        })
            .then(response => response.json())
            .then(response =>{
                //check for existing usernames, set state to old (previous) entries
                if(response.status === 409 || response.status === 500){
                    this.setState({
                        username: this.state.oldusername,
                        birthdate: this.state.oldbirthday
                    })
                    alert("Could not update UserProfile, Username already taken.")
                }
            })
            .catch(err =>{
                alert(`Something went wrong during the Update of credentials: ${err.message}`);
            })
    }

    credentials(){
        if(this.state.editable){
            return(
                <div>
                    <form>
                        <Label>Username    </Label>
                        <InputField type={"text"}
                                    onChange={this.handleNameChange}
                        />
                    </form>
                    <p>Online Status: {this.state.status}</p>
                    <form>
                        <Label>Birthday    </Label>
                        <InputField type={"text"}
                                    onChange={this.handleBirthdayChange}
                        />
                    </form>
                    <p>Creation Date: {this.state.creationdate}</p>
                </div>
            )
        }
        return(
            <div>
                <p>Username: {this.state.username}</p>
                <p>Online Status: {this.state.status}</p>
                <p>Birthday: {this.state.birthdate}</p>
                <p>Creation Date: {this.state.creationdate}</p>
            </div>
        )
    }


    render() {
        const textElement = this.credentials();
        if(localStorage.getItem("token")===null){return(<Container><h1>You must be logged in to view this page!</h1></Container>)}
        else{
            if(this.state.username === null){
                return(<Container><h1>Userpage does not exist!</h1></Container>)
            }
            return (
                <Container>
                    <PlayerContainer>
                        {textElement}
                        <div>
                            <ButtonContainer>
                                <Button
                                    onClick={() => {
                                        this.redirectToDashboard();
                                    }}
                                >
                                    ViewDashboard
                                </Button>
                                <Button
                                    disabled={!(localStorage.getItem("token")===this.state.token) || !this.state.username}
                                    width="50%"
                                    onClick={() => {
                                        if(this.state.editable){
                                            this.applyChanges();
                                        }
                                        this.setState({
                                            editable: !this.state.editable,
                                            editButtonText: (!this.state.editable)?"Save":"Edit",
                                        })
                                    }}
                                >
                                    {this.state.editButtonText}
                                </Button>
                            </ButtonContainer>
                        </div>
                    </PlayerContainer>
                </Container>
            );
        }
    }
}


export default withRouter(UserProfile);