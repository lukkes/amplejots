{
  settings: {
    sourceNoteUUID: null,
  },
  
  dailyJotOption: {
    async "Create tomorrow's jot" (app, noteHandle) {
      const newNoteName = this._getNextDaysName(noteHandle.name);
      console.log(newNoteName);
      
      const newNote = await app.createNote(newNoteName, noteHandle.tags);
      console.log(newNote);
      
      const newNoteHandle = await app.findNote({uuid: newNote});
      console.log(JSON.stringify(newNoteHandle));
      
      const url = `https://www.amplenote.com/notes/${ newNote }`;
      // const url = `https://www.amplenote.com/notes/new`;

      if (!this.settings.sourceNoteUUID) {
        const noteHandle = await app.prompt(
          "No template selected yet. Please choose one from this menu",
          {
            inputs: [
              {
                label: "Template note",
                type: "note"
              }
            ]
            
          }
        );
        if (!noteHandle) return;
        this.settings.sourceNoteUUID = noteHandle.uuid;
      }
      const sourceNote = await app.findNote({uuid: this.settings.sourceNoteUUID});
      console.log(JSON.stringify(sourceNote));
      
      const sourceContents = await app.getNoteContent(sourceNote);
      console.log(sourceContents);
      
      await app.insertContent(newNoteHandle, sourceContents);
      app.navigate(url);
      // TODO: insert note contents
    }
  },

  _getNextDaysName(dateString) {
    // Remove ordinal suffix from day
    var dateStringNoSuffix = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");

    var date = new Date(dateStringNoSuffix); // parse the date string into a Date object
    date.setDate(date.getDate() + 1); // increment the day by one

    // array with month names
    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

    // calculate the ordinal
    var day = date.getDate();
    var ordinal;
    if (day > 3 && day < 21) {
        ordinal = "th";
    } else {
        switch (day % 10) {
            case 1: ordinal = "st"; break;
            case 2: ordinal = "nd"; break;
            case 3: ordinal = "rd"; break;
            default: ordinal = "th"; break;
        }
    }

    // construct the next day's date string
    var nextDayString = monthNames[date.getMonth()] + " " + day + ordinal + ", " + date.getFullYear();

    return nextDayString;
  },
} 
