import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

import MenuBar from '../components/MenuBar';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useState } from 'react';

import RecieptItem from '../components/RecieptItem';

const RecieptLogger = () => {

  const [shop, setShop] = useState("");
  const [date, setDate] = useState(dayjs('2024-01-01'));
  const [items, setItems] = useState([{name:"",type:"", price:0}]);
  const [recieptError, setRecieptError] = useState("");
  const [subWarnings, setSubWarnings] = useState(0);

  const recieptItems = () => {
    return (
      <>
        {items.map((_item, i) => {  
          return (
            <RecieptItem key={i} items={items} subWarnings={subWarnings} setItems={setItems} setSubWarnings={setSubWarnings} index={i} />
          );
        })}
      </>
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {name:"",type:"",price:0}
    ])
  };
  
  const sendItems = () => {
    console.log(items);
    fetch("http://localhost:8000/reciept/", {
      method:"POST",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
      body: JSON.stringify({shop:shop,time:date.format('YYYY-MM-DD'),items:items})
    }).then((res) =>{
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  };

  //Assumes the reciept is uploaded right side up and not slanted
  const analyzeReciept = (event) => {
    if(event.target.files.length == 0)
    {
      return;
    }
    const file = event.target.files[0];
    event.preventDefault();
    if(file.type != "image/png") {
      setRecieptError("File must be a PNG");
      event.target.value = "";
    }
    else if(file.size/1024 > 500) {
      setRecieptError("File cannot exceed 500KB in size");
      event.target.value = ""
    }
    else {
      const form = new FormData();
      form.append("image",file);
  
      fetch("https://api.api-ninjas.com/v1/imagetotext",
        {
          method:"POST",
          headers:{
            "X-Api-Key":"vN7WEjoaxPJaLlontkHEqw==JUkXuNY3s3XUxeI1",
          },
          body: form,
        }
      ).then((res) => {
        res.json().then((body) => {
          //Removes stuff that clearly isn't supposed to be there
          const words = body.filter((item) => {
            return /^[a-zA-Z0-9$§,.: ]+$/.test(item.text);
          });
          words.sort((item1, item2) => {
            if(item1.bounding_box.y2 > item2.bounding_box.y1) {
              return 1;
            }
            else if(item1.bounding_box.y1 < item2.bounding_box.y2) {
              return -1;
            }
            else
            {
              if(item1.bounding_box.x2 > item2.bounding_box.x1) {
                return 1;
              }
              else if(item1.bounding_box.x1 < item2.bounding_box.x2) {
                return -1;
              }
            }
            return 0;
          });
          const words_adjusted = [];
          let last = null;
          setShop(words[0].text);
          words.forEach((word) => {
            const cleaned_word = word.text
                                  .replace("§","").replace(":","").replace(",","")
                                  .replace("$","").replace(" ","");
            if(last == null) {
              last = {text:cleaned_word,type:"",bounding_box:word.bounding_box};
            }
            else if(last.bounding_box.y2 > word.bounding_box.y1) {
              if(/^[0-9.]+$/.test(cleaned_word))
              {
                words_adjusted.push({name:last.text,type:last.type,price:cleaned_word})
                last = null;
              }
              else
              {
                last = {text: last.text + " " + cleaned_word,type:last.type,bounding_box:word.bounding_box}
              }
            }
            else
            {
              last = {text:cleaned_word,type:"",bounding_box:word.bounding_box};
            }
          })
          setItems(words_adjusted);
          event.target.value = "";
        });
      }).catch((err) => {
        console.log(err);
        setRecieptError("Could not process your reciept at this time. Please enter it manually.");
      })  
    }
  }

  const OCR = () => {
    return (
      <Card variant="outlined" sx={{margin:'5px'}}>
        <CardContent>
          <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'space-evenly'}}>
            <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'center'}}>
              <Typography variant='body1' sx={{visibility:recieptError?"visible":"hidden"}}>{recieptError}</Typography>
              <Button variant="contained" component="label">Upload Receipt(PNG)<input type="file" onChange={analyzeReciept} hidden/></Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  };

  const shopInfo = () => {
    const warnings = [];
    
    if(shop == "") { 
      warnings.push(<Typography key={"shop_name_empty"} color='error'>
        Shop name cannot be empty
      </Typography>);
    } else if(!(/^[a-z0-9'\- ]+$/i.test(shop))) {
      warnings.push(<Typography key={"shop_name_invalid_chars"} color='error'>
        Shop name cannot contain special characters other than - or '
      </Typography>);
    }

    return (
      <Box>
        {warnings}
        <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'space-evenly'}}>
          <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'center'}}>
            <Typography variant='h6' sx={{margin:'5px'}}>Store:</Typography>
            <TextField variant="outlined" placeholder="Store Name" value={shop} onChange={(e) => {setShop(e.target.value)}} />
          </Box>
          <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'center'}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Typography variant='h6' sx={{margin:'5px'}}>Date of Purchase:</Typography>
              <DatePicker value={date} onChange={(e) => {setDate(e)}}/>
            </LocalizationProvider>
          </Box>
        </Box>
      </Box>
    )
  }

  const actionButtons = () => {
    if(subWarnings == 0)
    {
      return (
        <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'space-evenly', margin:'10px'}}>
          <Button variant='contained' color='secondary' onClick={addItem}>Add Item</Button>
          <Button variant='contained' color='primary' onClick={sendItems}>Submit Reciept</Button>
        </Box>
      )
    }
    return (
      <Box sx={{display:'flex', 'align-items':'center', 'justify-content':'space-evenly', margin:'10px'}}>
        <Button variant='contained' color='secondary' onClick={addItem}>Add Item</Button>
        <Button variant='contained' color='primary' onClick={sendItems} disabled>Submit Reciept</Button>
      </Box>
    ) 
  }

  return (
    <>
    <MenuBar/>
    <Box sx={{'margin-left':'auto', 'margin-right':'auto', 'max-width':'75%'}}>
      {OCR()}
      <Card variant="outlined" sx={{margin:'5px'}}>
        <CardContent>
          {shopInfo()}
          <Divider sx={{width:'100%','margin-top':'5px','margin-bottom':'5px'}}/>
          {recieptItems()}
          {actionButtons()}
        </CardContent>
      </Card>
    </Box>
    </>
  );
}

export default RecieptLogger;