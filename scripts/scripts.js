window.onload = function () {



	$('.slider-wrap').slick({
				arrows: false,
				variableWidth: true
	})
	


	// Функция запроса ссылок на картинки по слову
	const getImage = (text) =>{
		const API_KEY = '13691921-301e306474303763492698897'
		const URL = "https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(text)

		return fetch(URL)
			.then(function(response) {
    			return response.json()
  			}).then(function(json) {
   				 return json.hits[0]["previewURL"]
  			}).catch(function(ex) {
    			console.log('parsing failed', ex)
  			})

	}



	// Функция запроса на яндекс переводчик

	const yandexTranslate = (text, direction='en-ru') => {
		const url = "https://translate.yandex.net/api/v1.5/tr.json/translate"
	  	const key = "trnsl.1.1.20190916T161000Z.5f6222beaf2ddadc.6402f17df6e2f210d611d8c297209b2d0c641fbd"

	 	return fetch(`${url}?key=${key}&text=${text}&lang=${direction}`)  
	 		.then(function(response) {
    			return response.json()
  			}).then(function(json) {
   				 return json.text[0]	
  			}).catch(function(ex) {
    			console.log('parsing failed', ex)
  			})
	}

	const translate = (text) => {
		const url = `https://translated-mymemory---translation-memory.p.rapidapi.com/api/get?mt=1&onlyprivate=0&langpair=en%7Cru&q=`
	  	const key = "30e8ae266cmsh562552162a826eep10a539jsn9e15c61f42d3"


		return fetch(`${url}${text}`, {
			"method": "GET",
			"headers": {
				"x-rapidapi-host": "translated-mymemory---translation-memory.p.rapidapi.com",
				"x-rapidapi-key": key
			}
		})
		.then(function(response) {				
		    return response.json()
		}).then(function(json) {  				 
		 	return json.responseData.translatedText   				 
		}).catch(function(ex) {
			console.log('parsing failed', ex)
		})

	}

	



	document.getElementById("findWordsButton").onclick = function () {
		let text = document.getElementById("textArea").value;

		//Обрабатываем текст - удаляем знаки препинания и символы перевода строки
		// Создаем из текста массив, используя пробел как разделитель
		//Удаляем предлоги, артикли
		// Оставляем только уникальные элементы в массиве

		let uniqueWordArray = text.replace(/[^\p{sc=Latin}]/gu, " ").split(" ")
			.filter((str) => {
		  		return str.length > 3
			})
			.filter((value, index, self) =>{
				return self.indexOf(value) === index
			})


		console.log("Количество слов в тексте: ", uniqueWordArray.length)



		//Для каждого слова
		//Запрос на онлайн транслятор 
		//Запрос накартинку
		//Добавляем карточку с переводом и картинкой
		uniqueWordArray.forEach(word => {
			translate(word).then((translate) => {
				getImage(word).then((url) => {
					console.log(word + ' '+ translate + ' ' + url)
					$('.slider-wrap').slick('slickAdd', `
						<div class="card">														
							<div class="check-mark">&#10003;</div>
							<div id="cardPicture">
								<img id="picture" class="card-picture" src=${url}>
							</div>
							<div class="original-word">${word}</div>
							<div class="translate-word">${translate}</div>
						</div>`
					)
				})
			})

		})

	}

	document.getElementById("listForwardButton").onclick = function () {

		$('.slider-wrap').slick("slickNext")
	}

	document.getElementById("listBackwardButton").onclick = function () {
		$('.slider-wrap').slick("slickPrev")
	}

}	


