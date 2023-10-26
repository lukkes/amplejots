let plugin = {
  settings: {
    sourceNoteUUID: null,
    jotTag: "daily-jots",
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

      let sourceContents = await app.getNoteContent(sourceNote);
      console.log(sourceContents);

      // Make sure we handle empty tasks bug manifesting October 2023
      sourceContents = sourceContents.replace("\\<!--", " <!--");

      await app.insertContent(newNoteHandle, sourceContents);
      app.navigate(url);
      // TODO: insert note contents
    }
  },

  appOption: {
    async "Resurface random jot" (app) {
      try {
        let jotTag = this.settings.jotTag || "daily-jots";
        console.log(jotTag);
        let jotList = await app.filterNotes({tag: jotTag});
        console.log(jotList);
        let randomJot = jotList[Math.floor(Math.random() * jotList.length)];
        console.log(randomJot);
        await app.navigate(`https://www.amplenote.com/notes/${ randomJot.uuid }`);
      } catch (err) {
        console.log(err);
        await app.alert(err);
      }
    },

    async "One Year Ago" (app) {
      try {
        let jotTag = this.settings.jotTag || "daily-jots";
        console.log(jotTag);
        let oneYearAgo = this._getOneYearAgoName(this._getAmplenoteDate(new Date()));
        let jotList = await app.filterNotes({tag: jotTag, query: oneYearAgo});
        if (jotList.length == 0) {
          console.log("Empty");
          await app.alert(`No jot found for a year ago in ${ jotTag }`);
          return;
        }
        console.log(jotList);
        await app.navigate(`https://www.amplenote.com/notes/${ jotList[0].uuid }`);
      } catch (err) {
        console.log(err);
        await app.alert(err);
      }
    }
  },

  _getAmplenoteDate(date) {
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
    var dateString = monthNames[date.getMonth()] + " " + day + ordinal + ", " + date.getFullYear();

    return dateString;
  },

  _getNextDaysName(dateString) {
    // Remove ordinal suffix from day
    var dateStringNoSuffix = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
    var date = new Date(dateStringNoSuffix); // parse the date string into a Date object
    date.setDate(date.getDate() + 1); // increment the day by one
    return this._getAmplenoteDate(date);
  },

  _getOneYearAgoName(dateString) {
    // Remove ordinal suffix from day
    var dateStringNoSuffix = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
    var date = new Date(dateStringNoSuffix); // parse the date string into a Date object
    date.setFullYear(date.getFullYear() - 1);
    return this._getAmplenoteDate(date);
  }
} 
