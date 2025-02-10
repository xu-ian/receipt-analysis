import {
  Box,
  Button,
  Card,
  CardContent
} from '@mui/material';

import Cookies from 'js-cookie';

import {useNavigate} from 'react-router-dom';

import { useEffect } from 'react';

const MenuBar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if(!Cookies.get("loggedin")) {
      navigate("/");
    }
  }, [])

  return (
    <Card sx={{margin:'10px'}}>
      <CardContent>
        <Box sx={{display:"flex"}}>
          <Button onClick={() => {navigate("/reciepts")}}>Reciept Logger</Button>
          <Button onClick={() => {navigate("/analyze")}}>Price Analysis</Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MenuBar;