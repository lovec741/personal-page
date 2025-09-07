function GenMaze(sizeX, sizeY)
{
	var fails = 0;
	var posibX = [];
	var posibY = [];
	var optionsX = [0, 2, 0, -2];
	var optionsY = [-2, 0, 2, 0];
	var mapSizeX = sizeX * 2+1;
	var mapSizeY = sizeY * 2+1;
	var map = Array(mapSizeX).fill(0).map(x => Array(mapSizeY).fill(0));
	var path = [];
	var x = Math.floor(Math.random() * sizeX) * 2;
	var y = 1;
	map[x][0] = 1;
	//console.log(map)

	map[x][y] = 1;
	path.push([x, y])
	//console.log(x + " " + y);
	//console.log("");
	var found = false;
	while (!found)
	{
		//Check for posibilities
		posibX = [];
		posibY = [];

		for (var i = 0; i < 4; i++)
		{
			var resultX = x + optionsX[i];
			var resultY = y + optionsY[i];
			if (!(resultX < 0 || resultX > (mapSizeX-2) || resultY < 0 || resultY > (mapSizeY-2) || map[resultX][resultY] == 1))
			{
				posibX.push(optionsX[i]);
				posibY.push(optionsY[i]);
			}
		}
		if (posibX.length != 0)
		{
			var choice = Math.round(Math.random() * (posibX.length-1));
			//console.log(posibX[choice], posibY[choice])
			//console.log(x + (posibX[choice] / 2), y + (posibY[choice] / 2))
			map[x + (posibX[choice] / 2)][y + (posibY[choice] / 2)] = 1;
			
			x += posibX[choice];
			y += posibY[choice];
			map[x][y] = 1;
			path.push([x, y]);
		}
		else
		{
			if (fails < ((sizeX+sizeY)/2*5))
			{
				var choice = Math.ceil(Math.random() * (path.length-1));
				//console.log(path, choice)
				x = path[choice][0];
				y = path[choice][1];
				fails++;
			}
			else
			{
				found = true;
			}

		}
		if (y > mapSizeY - 3)// && path.length >= (sizeX * sizeY))
		{
			//console.log("Done");
		}

	}
	
	var holesFound = 100;
	var times = 0;
	while (holesFound != 0)
	{
		holesFound = 0;
		if (times < 10)
		{
			for (var hX = 0; hX < sizeX; hX++)
			{
				for (var hY = 0; hY < sizeY; hY++)
				{
					if (map[hX * 2][hY * 2 + 1] == 0)
					{
						holesFound++;
						var done = false;
						var first = true;
						var fX = hX * 2;
						var fY = hY * 2 + 1;
						map[fX][fY] = 1;
						while (!done)
						{
							posibX = [];
							posibY = [];
							for (var i = 0; i < 4; i++)
							{
								var resultX = fX + optionsX[i];
								var resultY = fY + optionsY[i];
								if (first)
								{
									if (!(resultX < 0 || resultX > (mapSizeX-2) || resultY < 0 || resultY > (mapSizeY-2)) && map[resultX][resultY] == 1)
									{
										posibX.push(optionsX[i]);
										posibY.push(optionsY[i]);
									}
								}
								else
								{
									if (!(resultX < 0 || resultX > (mapSizeX-2) || resultY < 0 || resultY > (mapSizeY-2) || map[resultX][resultY] == 1))
									{
										posibX.push(optionsX[i]);
										posibY.push(optionsY[i]);
									}
								}
								
							}
							
							if (posibX.length != 0)
							{
								var choice = Math.round(Math.random() * (posibX.length-1));
								//console.log(choice, fX, posibX, posibY)
								map[fX + (posibX[choice] / 2)][fY + (posibY[choice] / 2)] = 1;
								if (first)
								{
									first = false;
									map[fX + posibX[choice]][fY + posibY[choice]] = 1;
								}
								else
								{
									fX += posibX[choice];
									fY += posibY[choice];
									map[fX][fY] = 1;
								}
								
								
							}
							else
							{
								done = true;
							}
							
						}
						

					}
				}
				//console.log("HOLES", holesFound)
			}
			times++;
		}
		
	}
	map[Math.floor(Math.random() * sizeX) * 2][mapSizeY-1] = 1;
	//console.log(times);
	/*var returnText = "\n";
	for (var pY = 0; pY < mapSizeY; pY++)
	{
		for (var pX = 0; pX < mapSizeX; pX++)
		{
			if (map[pX, pY] == 0)
			{
				tilemap.SetTile(new Vector3var(pX - (sizeX+1), (mapSizeY - pY) - (sizeY+1), 0), tile);
			}
			returnText += map[pX, pY].ToString() + " ";
		}
		returnText += "\n";
	}
	console.log(returnText);*/
	const canvas = document.getElementById("canvas")
	const c = canvas.getContext("2d")
	const tile_size = 1
	canvas.width = tile_size*(sizeY * 2+1)
	canvas.height = tile_size*(sizeX * 2+1)
	for (var xp = 0; xp < map[0].length; xp++) {
		for (var yp = -1; yp < map.length-1; yp++) {
			c.beginPath();
			if (yp == -1 || map[yp][xp] == 0) {
				c.fillStyle = "rgb(0,0,0)"
			} else {
				c.fillStyle = "rgb(255,255,255)"
			}
			c.rect(tile_size*xp, tile_size*(yp+1), tile_size, tile_size);
			c.fill();
		}
	}
	
}

GenMaze(10, 55);


