import * as Plot from "@observablehq/plot";
import { Box, Button, ButtonGroup, Card, CardContent, MenuItem, Select, TextField } from "@mui/material";
import PlotFigure from "../components/PlotFigure";
import { useState, useEffect } from "react";
import MenuBar from '../components/MenuBar';

/*Possible charts: 
  - Bar for comparing item across different stores
  - Line/Difference for item across a period of time(Single Store, Across Store)
  - Line for amount spent per time frame
  - Global/Personal toggle for global statistics vs personal statistics
*/
export default function Analyze() {
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [global, setGlobal] = useState(false);
  const [category, setCategory] = useState(false);
  const [comparison, setComparison] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chosen, setChosen] = useState("Any");
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState("Any");

  useEffect(() => {
    //Retrieve the data from the database
    fetch("http://localhost:8000/stores/?user="+!global, {
      method:"GET",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
    }).then((res) =>res.json()).then((data) => {
      data.sort();
      setStores(["Any",...data]);
    }).catch((err) => {
      console.log(err);
    });
    fetch("http://localhost:8000/categories/?user="+!global, {
      method:"GET",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
    }).then((res) =>res.json()).then((data) => {
      data.sort();
      setCategories(["Any",...data]);
    }).catch((err) => {
      console.log(err);
    });
    fetch("http://localhost:8000/items/?user="+!global, {
      method:"GET",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
    }).then((res) =>res.json()).then((data) => {
      data.sort();
      setItems(["Any",...data]);
    }).catch((err) => {
      console.log(err);
    });
  }, [global]);

  const updateChosen = (e) => {
    setChosen(e.target.value);

    let requestString = "http://localhost:8000/reciept/";
    if(!global) { //Data from all users
      requestString += "?user=true";
    } else {
      requestString += "?user=false";
    }

    if(category) {//Data modified by category    
      requestString += "&category=" + (e.target.value == "Any" ? "%" : e.target.value);
      requestString += "&item=%";
    } else {//Data modified by item
      requestString += "&item=" + (e.target.value == "Any" ? "%" : e.target.value);
      requestString += "&category=%";
    }

    if(comparison) {//Compare by store
      requestString += "&shop=" + (store == "Any" ? "%" : store);
    }
    else {
      requestString += "&shop=%";
    }

    updatePlot(requestString);
  }

  const updateStore = (e) => {
    setStore(e.target.value);
    let requestString = "http://localhost:8000/reciept/";

    if(!global) { //Data from all users
      requestString += "?user=true";
    } else {
      requestString += "?user=false";
    }

    if(category) {//Data modified by category    
      requestString += "&category=" + (chosen == "Any" ? "%" : chosen);
      requestString += "&item=%";
    } else {//Data modified by item
      requestString += "&item=" + (chosen == "Any" ? "%" : chosen);
      requestString += "&category=%";
    }

    if(comparison) {//Compare by store
      requestString += "&shop=" + (e.target.value == "Any" ? "%" : e.target.value);
    } else {
      requestString += "&shop=%";
    }

    updatePlot(requestString);
  }

  const updateBoth = () => {
    let requestString = "http://localhost:8000/reciept/";
    if(!global) { //Data from all users
      requestString += "?user=true";
    } else {
      requestString += "?user=false";
    }

    if(category) {//Data modified by category    
      requestString += "&category=" + (chosen == "Any" ? "%" : chosen);
      requestString += "&item=%";
    } else {//Data modified by item
      requestString += "&item=" + (chosen == "Any" ? "%" : chosen);
      requestString += "&category=%";
    }

    if(comparison) {//Compare by store
      console.log(store);
      requestString += "&shop=" + (store == "Any" ? "%" : store);
    } else {
      requestString += "&shop=%";
    }

    updatePlot(requestString);
  } 

  const updatePlot = (request) => {
    fetch(request, {
      method:"GET",
      credentials:'include',
      headers: {
        "Content-type":"application/json"
      },
    }).then((res) => res.json()).then((data) => {
      const newData = [];
      data.forEach((datum) => {
        datum.time = new Date(datum.time);
        newData.push(datum);
      });
      setData(newData);
      setSortedData(newData);
    }).catch((err) => {
      console.log(err);
    });
  }

  useEffect(updateBoth, [global, comparison]);

  const sortByDropdown = () => {
    return (
      <Select sx={{minWidth:'120px'}}
        helperText={category ? "Choose a category": "Choose an item"}
        value={chosen}
        onChange={updateChosen}
      >
        {
          category 
          ? categories.map((categ) => {
            return (
              <MenuItem value={categ}>
                {categ}
              </MenuItem>
            )
          }) 
          : items.map((item) => {
            return (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            )
          })
        }
      </Select>
    )
  }

  const shopDropdown = () => {
    if(comparison) {
      return (
        <TextField 
          helperText="Choose a store"
          select
          value={store}
          onChange={updateStore}
        >
          {
            stores.map((store) => {
              return (
                <MenuItem key={store} value={store}>
                  {store}
                </MenuItem>
              )
            })
          }
        </TextField>
      )
    }
  }

  const showPlot = () => {
    const transformedData = [];

    if(comparison) {
      if(store == "Any") {
        data.forEach((datum) => {
          const index = transformedData.findIndex((d) => d.shop == datum.shop);
          if(index != -1) {
            transformedData[index].price += datum.price;
            transformedData[index].quantity += 1;
          } else {
            transformedData.push({shop: datum.shop, price:datum.price,quantity:1});
          }
        });
    
        transformedData.forEach((datum) => {
          datum.price = datum.price / datum.quantity;
        }); 
        return (
          <PlotFigure
            options={{
              color:{legend:transformedData.length > 0},
              marks: [
                Plot.barY(transformedData,
                {y: "price", x: "shop", stroke:"shop",fill:"shop"}) 
              ]
            }}
          />
        )
      } else {
        data.forEach((datum) => {
            transformedData.push({price:datum.price,name:datum.name,category:datum.type});
        });
        return (
          <PlotFigure
            options={{
              color:{legend:transformedData.length > 0},
              marks: [
                Plot.barY(transformedData,
                {y: "price", x: category?"category":"name", stroke:category?"category":"name",fill:category?"category":"name"}) 
              ]
            }}
          />
        )
      }
    } else {
      data.forEach((datum) => {
        const index = transformedData.findIndex((d) => d.time.getTime() == datum.time.getTime());
        if(index != -1) {
          transformedData[index].price += datum.price;
          transformedData[index].quantity += 1;
        } else {
          transformedData.push({time: datum.time, type:datum.type, name:datum.name, price:datum.price,quantity:1});
        }
      });
  
      transformedData.forEach((datum) => {
        datum.price = datum.price / datum.quantity;
      });
      return (
        <PlotFigure
          options={{
            color:{legend:transformedData.length > 0},
            marks: [
              Plot.dot(transformedData,
                {y:"price",x:"time",
                  stroke:category?"type":"name",fill:category?"type":"name"
                }),
              Plot.lineY(transformedData,
              {y: "price", x: "time", z:category?"type":"name", sort: "time",
                stroke:category?"type":"name"
              })
            ]
          }}
        />
      )
    }
  }

  return (
    <>
    <MenuBar/>
    <Box>
    <Card sx={{width:"75%", margin:"auto"}}>
      <CardContent>
        <Box sx={{display:'flex', justifyContent: 'center', alignItems:'center'}}>
          <ButtonGroup sx={{margin:'10px'}}>
            <Button variant={global ? "contained" : "outlined"} onClick={()=>{setGlobal(true)}}>Global</Button>
            <Button variant={!global ? "contained" : "outlined"} onClick={()=>{setGlobal(false)}}>Personal</Button>
          </ButtonGroup>
          <ButtonGroup sx={{margin:'10px'}}>
            <Button variant={category ? "contained" : "outlined"} onClick={()=>{setCategory(true)}}>By Category</Button>
            <Button variant={!category ? "contained" : "outlined"} onClick={()=>{setCategory(false)}}>By Item</Button>
          </ButtonGroup>
          {sortByDropdown()}
          <ButtonGroup sx={{margin:'10px'}}>
            <Button variant={comparison ? "contained" : "outlined"} onClick={()=>{setComparison(true)}}>By Store</Button>
            <Button variant={!comparison ? "contained" : "outlined"} onClick={()=>{setComparison(false)}}>over Time</Button>
          </ButtonGroup>
          {shopDropdown()}
        </Box>
        <Box sx={{width:"75%",margin:'auto'}}>
          {showPlot()}
        </Box>
      </CardContent>
    </Card>
    </Box>
    </>
  );
}