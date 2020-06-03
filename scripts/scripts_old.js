window.onload = function () {
	const slider = document.querySelector('.slider-wrap');
	let cardArray;
	//let translateWordArray = [];
	//let uniqueWordsArray = [];
	let counter = 0;
	const deleteCardArray = []; // массив для хранения удаленных слов

	// Функция находит уникальные элементы в массиве
	function unique(arr) {
	  let result = [];

	  for (let str of arr) {
	    if (!result.includes(str)) {
	      result.push(str)
	    }
	  }

	  return result
	}

	// Функция Добавления в массив известных слов 
	function pushDeletedWord(word) {
		if (deleteCardArray.includes(word)) {
			let index = deleteCardArray.indexOf(word);
			deleteCardArray.splice(index, 1);
		} else {
			deleteCardArray.push(word);
		}
	}

	// // Функция создания карточек в слайдере из массива слов и переводов

	function generateCard(uniqueWordsArray, translatedWordArray, imageUrlsArray) {
		for (let counter = 0; counter < uniqueWordsArray.length; counter++) {
			//translateWordArray = uniqueWordsArray[counter].split(" ");
			slider.innerHTML += `
			<div class="card">
				
				
				<div class="check-mark">&#10003;</div>
				<div id="cardPicture">
					<img id="picture" class="card-picture" src=${imageUrlsArray[counter]}>
				</div>
				<div class="original-word">${uniqueWordsArray[counter]}</div>
				<div class="translate-word">${translatedWordArray[counter]}</div>

			</div>`;
		}
	}

	// Асинхронная функция запроса ссылок на картинки по слову
	let getImageUrlsFromDescriptions = async(img_description) => {
		let API_KEY = '13691921-301e306474303763492698897';
		let URL = "https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(img_description);
	  
	  let response = await fetch(URL)
	  let imageUrls = await response.json()
	  //console.log(imageUrls)
	  if (parseInt(imageUrls.totalHits) > 0){
	  	//document.getElementById("image").src = imageUrls.hits[0]["webformatURL"]
		//console.log(imageUrls.hits[0]["webformatURL"])

		//Можно поискать более подходящие картинки по индексу массива, но нужно проверять индекс
		return imageUrls.hits[0]["previewURL"] 
		}
	  else{
		return ""
	  }
	  	
	}

	// Асинхронная функция запроса на яндекс переводчик
	/*
		Переводится весь текст целиком, разделяясь по словам палочкой " | "
		чтобы сохранить соответствие слова и перевода.
		Поскольку слайдер сначала нужно зарядить карточкам полностью,
		а функции запроса на поиск картинок работают асинхронно, то ждем,
		пока вернется перевод, потом ссылки с картинками, потом 
		заряжаем слайдер. Поэтому пришлось запихать все в одну функцию

	*/
	let yandexTranslate = async(text, direction='en-ru') => {

	  const url = "https://translate.yandex.net/api/v1.5/tr.json/translate";
	  const key = "trnsl.1.1.20190916T161000Z.5f6222beaf2ddadc.6402f17df6e2f210d611d8c297209b2d0c641fbd";
	  
	  let response = await fetch(`${url}?key=${key}&text=${text}&lang=${direction}`)
	  let translateObject = await response.json()
	  
	  // Разделение текста на слова по палочке " | ", чтобы сохранить соответствие слова и перевода
	  let wordArray = text.split("^")
	  //wordArray = wordArray.filter(word => word !=="")
	  console.log(wordArray)
	  console.log("Количество слов на перевод : ", wordArray.length)
	  console.log(wordArray.text)

	  
	  // Разделение перевода на слова по палочке " | ", чтобы сохранить соответствие слова и перевода
	  console.log(translateObject.text[0])
	  let translateWordArray = translateObject.text[0].split("^")
	  //translateWordArray = translateWordArray.filter(word => word)
	  console.log(translateWordArray)
	  console.log("Количество переведенных слов : ", translateWordArray.length)

	  //Создаем словарь
	  let dictionary = []

	  for (let i in wordArray) {
	  	dictionary[i] = {"word": wordArray[i]}
	  }
	  for (let i in translateWordArray) {
	  	dictionary[i]["translate"] =  translateWordArray[i]
	  }
	  //Очищаем словарь от пустых значений. Так, потому что создаются пустые строки при переводе и смещается перевод
	  dictionary = dictionary.filter(wordTranslateObject => wordTranslateObject["word"] !=="")

	  console.log(dictionary)

	  //Переписываем массивы слов и переводов
	  wordArray = dictionary.map(wordTranslateObject => wordTranslateObject["word"])
	  translateWordArray = dictionary.map(wordTranslateObject => wordTranslateObject["translate"])
	  
	  //Генерируем массив ссылок на картинки
	  
	  let imageUrlsArray = []
	  
	  // Функция для прикручивания асинхроных функций к forEach
	  async function asyncForEach(array, callback) {
		  for (let index = 0; index < array.length; index++) {
		    await callback(array[index], index, array);
		  }
		}

	  //Генерируем массив ссылок на картинки
	  const generateImageUrlsArray = async () => {
	  await asyncForEach(wordArray, async (word) => {
    	//imageUrl = await getImageUrlsFromDescriptions(`${word}` + "icon");
    	imageUrl = await getImageUrlsFromDescriptions(word);
    	imageUrlsArray.push(imageUrl)
  		});
	  

	  // генерируем карточки
	  await generateCard(wordArray, translateWordArray, imageUrlsArray);
 	  console.log(imageUrlsArray)

 	  // запускаем слайдер
		await $('.slider-wrap').slick({
			arrows: false,
			variableWidth: true
		});

	  }

	  // Генерируем массив ссылок на картинки
	  generateImageUrlsArray();
	  
	}

	document.getElementById("findWordsButton").onclick = function () {
		let text = document.getElementById("textArea").value;

		// Обрабатываем текст - удаляем знаки препинания и символы перевода строки

		//text = text.replace(/[0123456789.,\/#!$%\^&\*;:{}=\-_`—~()?<>"”“’‘\u000A]/g," ")
		//text = text.replace(/[-\d\.,#!$%^&*;:\{\}=\[\]_`\—\~()\?<>"”“’‘\n]/g, " ")
		text = text.replace(/[^\p{sc=Latin}]/gu, " ")

		// Создаем из текста массив, используя пробел как разделитель
		let wordArray = text.split(" ")

		//Удаляем предлоги, артикли
		wordArray = wordArray.filter((str) => {
		  return str.length > 3
		})

		console.log("Количество слов в тексте: ", wordArray.length)
		//console.log(wordArray)



		// Оставляем только уникальные элементы в массиве

		let uniqueWordArray = unique(wordArray)
		
		//Объединение массива в текст с палочкой разделителем " | " чтобы перевод,
		// если он из нескольких слов,соответствовал номеру слова в массиве
		
		let joinedUniqueWordArray = uniqueWordArray.join(" ^^ ")
		console.log(joinedUniqueWordArray)

		//Запрос на онлайн транслятор
		yandexTranslate(joinedUniqueWordArray)


	}

	document.getElementById("listForwardButton").onclick = function () {

		$('.slider-wrap').slick("slickNext")
	}

	document.getElementById("listBackwardButton").onclick = function () {
		$('.slider-wrap').slick("slickPrev")
	}



	slider.addEventListener("click", () => {
		cardArray = slider.querySelectorAll(".card:not(.slick-cloned)");
		let slide = $('.slider-wrap').slick('slickCurrentSlide'); // получаем номер слайда, который надо удалить
		let checkMark = cardArray[slide].querySelector(".check-mark"); 
		checkMark.classList.toggle('active');  // добавляем галочку на карточку
		pushDeletedWord(cardArray[slide].firstElementChild.innerHTML) // пушим английское слово в массив
		console.log(`Массив удаленных слов: ${deleteCardArray}`);
	})


}	


