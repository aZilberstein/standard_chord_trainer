const storage = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Hb', 'H'];

// functions
function playChord(element){
	let counter = 0;
	setInterval(function(){
		if ((element.children().length) && (element.children()[counter] !== undefined)){
			element.children()[counter].play();
			counter++;
		}
		else {
			clearInterval();
		}
	}, 700);
}
function compareChords(one, two){
	return !one.some(function(element, index, array){return element !== two[index]});
}
function newRound(){
	$('.userChordName').slideUp(600);
	$('.resultContent').slideUp(600);
	$('.randomChordDisplay').children().css('opacity', '0');
	$('.randomChordDisplay').slideUp(600);
	random.chordTypeChoice();
}
function keyboardStyle(){
	$('.pianoKey').each(function(index, item){
		if (item.innerText.includes('#') || item.innerText.includes('b')){
			item.className += ' sharpKey';
		}
	});
}

//vue instances
const random = new Vue({
	el: '#randomChord',
	data: {
		type : '',
		notes: []
		},
		methods: {
			randomizer: function() {
				if (Math.floor(Math.random()*10) == 0){
					return 0;
				}
				else if (Math.floor(Math.random()*10) == 1){
					return 1;
				}
				else {
					return Math.floor(Math.random()*10 + 2)
				}
			},
			chordTypeChoice : function(){
				let typeRandom = Math.round(Math.random());
				(typeRandom ? this.type = 'major' : this.type = 'minor');
				this.makeChord(this.type);
			},
			determineName: function(name){
				let chordName = '';
						if (name.includes('#')){
							chordName = name[0] + '_sharp';
						}
						else if (name.includes('b')){
							chordName = name[0] + '_flat';
						}
						else {
							chordName = name[0];
						}
					if (name.includes('octave')){
						chordName += '_octave';
					}
				return chordName;
			},
			makeChord: function(type) {
				let random = this.randomizer();
				let remainder;
				let soundBank = $('#randomChordPlayback');
				soundBank.empty();

				// choosing the root/the first note
				this.notes[0] = storage[random];
				soundBank.append('<audio src="audio/' + this.determineName(storage[random])
								+ '.mp3" type="audio/mpeg"></audio>');

				// the third note
				if (random + ((type == 'major') ? 4 : 3) < storage.length){
					this.notes[1] = storage[random+((type == 'major') ? 4 : 3)];
					soundBank.append('<audio src="audio/' + this.determineName(this.notes[1])
									+ '.mp3" type="audio/mpeg"></audio>');
				}
				else {
					remainder = ((type == 'major') ? 4 : 3)-(storage.length - random);
					this.notes[1] = storage[remainder];
					soundBank.append('<audio src="audio/' + this.determineName(this.notes[1]) 
									+ '_octave.mp3" type="audio/mpeg"></audio>');
				}

				// the fifth note
				if (remainder){
					if (remainder + ((type == 'major') ? 3 : 4) < storage.length){
						this.notes[2] = storage[remainder+((type == 'major') ? 3 : 4)];
						soundBank.append('<audio src="audio/' + this.determineName(this.notes[2])
										+ '_octave.mp3" type="audio/mpeg"></audio>');
					}
				}
				else {
					if (random + 7 < storage.length){
						this.notes[2] = storage[random+7];
						soundBank.append('<audio src="audio/' + this.determineName(this.notes[2])
										+ '.mp3" type="audio/mpeg"></audio>');
					}
					else {
						remainder = ((type == 'major') ? 3 : 4)-(storage.length - (random+((type == 'major') ? 4 : 3)));
						this.notes[2] = storage[remainder]
						soundBank.append('<audio src="audio/' + this.determineName(this.notes[2]) 
										+ '_octave.mp3" type="audio/mpeg"></audio>');
					}
				}
				setTimeout(playChord(soundBank), 500);
			},
			clearChord: function(){
					this.notes = [];
					this.name = '';
					this.type = '';
					$('#randomChordPlayback').empty();
			}
	}	
});

const user = new Vue({
	el: '#userChord',
	data: {
		type : '',
		storage : storage,
		notes: [],
		comparison : ''
		},
	methods: {
		editUserChord: function(choice){
			if (this.notes.length<3){
				this.notes.push(choice);
			}
		},
		determineType: function(){
			let first = this.notes[0];
			let second = this.notes[1];
			let third = this.notes[2];

			if (((storage.indexOf(first)+4) % storage.indexOf(second) == 0) 
				&& ((storage.indexOf(second)+3) % storage.indexOf(third) == 0)){
				return 'major';
			}
			else if (((storage.indexOf(first)+3) % storage.indexOf(second) == 0) 
				&& ((storage.indexOf(second)+4) % storage.indexOf(third) == 0)){
				return 'minor';
			}
		},
		playNote: function(choice){
			let chordName = random.determineName(choice);
			if ($('#userChordPlayback').children('audio').length < 3){
					$('#userChordPlayback').append('<audio src="audio/' + chordName + '.mp3" type="audio/mpeg"></audio>');
			}
			let currentNote = new Audio('audio/' + chordName + '.mp3');
			currentNote.play();
			},
		clearChord: function(){
			this.notes = [];
			this.type = '';
			this.comparison = '';
			$('#userChordPlayback').empty();
		},
		submitUserChord: function(){
			let soundBank = $('#userChordPlayback');
			setTimeout(playChord(soundBank), 500);

			//setting the type (major/minor) of the submitted chord if there was any
			((this.notes.length > 0) ? this.type = this.determineType() : this.type = '');
			
			$('.resultContent').slideDown();
			$('.randomChordDisplay').children().css('opacity', '1');
			$('.randomChordDisplay').slideDown(600);
			$('.userChordName').slideDown(600);

			if (compareChords(random.notes, user.notes) && (random.notes.length > 0)){
				this.comparison = 'Correct!'
			}
			else {
				this.comparison = 'Try again...';
			}
		}
	}
});
const result = new Vue({
	el: '#displayResult',
	data: user
});
const controls = new Vue({
	el: '#controls',
	data: user
});
const keyboard = new Vue({
	el: '#keyboard',
	data: user
});

// the newRound event handler
$('.newRound').on('click', function(){
	random.clearChord();
	user.clearChord();
	newRound();
});

// the keyboard styler
window.onload = keyboardStyle;