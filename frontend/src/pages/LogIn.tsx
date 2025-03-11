import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LogIn = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errmsg, setErrmsg] = useState('');
  const navigate = useNavigate();

  const updateUsername = (e:any):void => {
    setUsername(e.target.value);
  }

  const updatePassword = (e:any):void => {
    setPassword(e.target.value);
  }

  const errors = () => {
    if(errmsg) {
      return (
        <Box sx={{display:'flex', justifyContent:'center'}}>
          <Typography variant='body1' color='error'>{errmsg}</Typography>
        </Box>
      )
    }
  }

  const sendSignIn = ():void => {
    fetch("http://localhost:8000/login/", {
      method:"POST",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
      body: JSON.stringify({username:username,password:password})
    }).then((res:any) => {
      if(res.status != 200) {
        console.log("Error message:", res);
        res.json().then((data:any) => {
          setErrmsg(data.detail);
        })
      } else {
        navigate("/reciepts");
      }

    })
    .catch((error:any) => {
      console.log(error);
    });
  }

  return (
    <Box>
      <Card sx={{'width':'75%', height:'90vh', 'margin-top':'2.5%', 'margin-bottom:':'2.5%', 'margin-left':'auto', 'margin-right':'auto'}}>
        <CardContent >
          <Typography variant="h2" sx={{'text-align':'center', margin:'5%'}}>Log In</Typography>
          {errors()}
          <Box sx={{margin:'5%'}}>
            <Typography variant="h4" sx={{'text-align':'center', margin:'1%'}}>Username</Typography>
            <Box sx={{width:'100%', display:'flex', 'justify-content':'center'}}>
              <TextField 
                variant="outlined" 
                placeholder="username" 
                sx={{'text-align':'center'}}
                value = {username}
                onChange = {updateUsername}
              />
            </Box>
          </Box>
          <Box sx={{margin:'5%'}}>
            <Typography variant="h4" sx={{'text-align':'center', margin:'1%'}}>Password</Typography>
            <Box sx={{width:'100%', display:'flex', 'justify-content':'center'}}>
              <TextField 
                variant="outlined" 
                type="password" 
                placeholder="password" 
                value = {password}
                onChange = {updatePassword}
              />
            </Box>
          </Box>
          <Box sx={{display:'flex','justify-content':'space-evenly'}}>
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            <Button variant='contained' onClick={sendSignIn}>Log In</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LogIn;