import {
  Box,
  Button,
  Divider,
  TextField,
  Typography
} from '@mui/material';

import {useState} from 'react';

const RecieptItem = (props: { items: {name:string,type:string,price:number}[], subWarnings:number, 
    setItems: any; setSubWarnings: any, index: number; }) => {
  const {
    items,
    subWarnings,
    setItems = () => {},
    setSubWarnings = () => {},
    index
  } = props;

  const [warnNum, setWarnings] = useState(0);

  const showWarnings = ():any => {
    const warnings = [];
    if(items[index].name == "") { 
      warnings.push(<Typography key={"item_name_empty"} color='error'>
        Item name cannot be empty
      </Typography>);
    }
    else if(!(/^[a-z0-9'\- ]+$/i.test(items[index].name))) {
      warnings.push(<Typography key={"item_name_invalid_chars"} color='error'>
        Item name cannot contain special characters other than - or '
      </Typography>);
    }

    console.log(items[index].type,"",items[index].type == "")

    if(items[index].type == "") {
      warnings.push(<Typography key={"item_type_empty"} color='error'>
        Item type cannot be empty
      </Typography>);
    }
    else if(!(/^[a-z0-9'\- ]+$/i.test(items[index].type))) {
      warnings.push(<Typography key={"item_name_invalid_chars"} color='error'>
        Item type cannot contain special characters other than - or '
      </Typography>);
    }
    
    if(warnNum != warnings.length)
    {
      setSubWarnings(subWarnings - warnNum + warnings.length);
      setWarnings(warnings.length);
    }

    return (
      <>
        {warnings}
      </>
    )

  };

  const updateItem = (e:any):void => {
    const newItems = items.map((item, i) => {
      if(i === index) {
        return {name:e.target.value, type:item.type, price:item.price}
      }
      else {
        return item;
      }
    });
    setItems(newItems);
  }

  const updateType = (e:any):void => {
    const newItems = items.map((item, i) => {
      if(i === index) {
        return {name:item.name, type:e.target.value, price:item.price}
      }
      else {
        return item;
      }
    });
    setItems(newItems);
  }

  const updatePrice = (e:any):void => {
    const newItems = items.map((item, i) => {
      if(i === index) {
        return {name:item.name, type:item.type, price:e.target.value}
      }
      else {
        return item;
      }
    });
    setItems(newItems);
  }

  const removeItem = ():void => {
    setItems(items.slice(0,index).concat(items.slice(index+1,items.length)));
  };

  return (
    <Box>
      {showWarnings()}
      <Box key={index} sx={{display:'flex', margin: '5px', 'justify-content': 'space-around'}}>
        <Box sx={{display:'flex', 'align-items':'center', margin:'5px'}}>
          <Typography variant="h6">Item: </Typography>
          <TextField variant="outlined" placeholder="Bananas" value={items[index].name} onChange={updateItem}/>
        </Box>
        <Box sx={{display:'flex', 'align-items':'center', margin:'5px'}}>
          <Typography variant="h6">Item Type: </Typography>
          <TextField variant="outlined" placeholder="Fruit" value={items[index].type} onChange={updateType}/>
        </Box>
        <Box sx={{display:'flex', 'align-items':'center', margin: '5px'}}>
          <Typography variant="h6">Price: </Typography>
          <TextField variant="outlined" placeholder="$1.00" type="number" value={items[index].price} onChange={updatePrice}/>
        </Box>
        <Button variant='contained' color='error' onClick={removeItem}>
          Remove Item
        </Button>
      </Box>
      <Divider sx={{width:'100%'}}/>
    </Box>
  )
};

export default RecieptItem;