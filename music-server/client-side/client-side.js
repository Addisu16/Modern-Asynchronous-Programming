window.onload = function(){
    document.getElementById('loginBtn').onclick=login;
    document.getElementById('logout').onclick = logout;
}

async function login(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(response.ok){
        const result = await response.json();
        sessionStorage.setItem('token', result.accessToken);
        sessionStorage.setItem('username', result.username);
        document.getElementById('main-div').style.display='none';
        document.getElementById('main-div2').style.display='block';
        document.getElementById('logout').style.display='block';
        document.getElementById("favorites").style.display='block';
        document.getElementById('play').style.display='block';
        document.getElementById("repeat").style.display='block';
        fetchAllSongs();
        
     
      
    } else {
        document.getElementById('errorMsg').innerText = 'Incorrect username and password';
    }
   
}


let musicList = null;

async function fetchAllSongs() {
  let response=await fetch("http://localhost:3000/api/music", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => {
      console.log(songs);
      musicList = songs;
      printAllSongs(songs);
    });
}

//Display all songs
//=================================================================================================================//
function printAllSongs(list) {
  for (let each of list) {
    fetch(`http://localhost:3000/${each.urlPath}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then((songs) => {
      
      let myTable = `
        <tr>
        <td><a href="${songs.url}">${each.title}</a><br></td>
        <td><button class="addBtn" id=${each.id} onclick="addToFavorites('${each.id}')">+</button></td>
        </tr>
       `;
      document.getElementById("main-div2").innerHTML += myTable;
    });
  }
}
//Add to favorite list
//=================================================================================================================//
let myFavoriteMusicList = [];

let index = 0;
function addToFavorites(id) {
  for (let each of musicList) {
    if (each.id == id) {
      if (myFavoriteMusicList.includes(each)) {
        continue;
      } else {
        myFavoriteMusicList.push(each);
        fetch(`http://localhost:3000/${each.urlPath}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }).then((music) => {
          let id = each.id;
          let title = each.title;
          let url = music.url;
          let myFavoriteTable = `
          <tr id=${each.id}>
              <td><a href="${music.url}">${each.title}</a><br></td>
              <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">Remove</button></td>
              <td> <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button></td>
          </tr>
        `;
          //========================================================================================//
          fetch(`http://localhost:3000/${each.urlPath}`, {
            method: "POST",
            body: JSON.stringify({
              id,
              title,
              url,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            // .then((response) => response.json())
            // .then((item) => {
            //   print.innerHTML += `
            //         id:  ${item.id} <br> 
            //         name: ${item.title} <br> 
            //         price: ${item.price} <br>
            //         description: ${item.description}<br> ==========================<br>`;
            // })
          //=======================================================================================//
          index++;

          document.getElementById("favorites").innerHTML += myFavoriteTable;
        });
      }
    }
  }
}

function logout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    document.getElementById('main-div2').style.display='none';
    document.getElementById('logout').style.display='none';
    document.getElementById("favorites").style.display='none';
    document.getElementById('main-div').style.display='block';
    document.getElementById('play').style.display='none';
    document.getElementById("repeat").style.display='none';
    

    
  }


