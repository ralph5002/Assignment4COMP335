import React from 'react';
import { createRoot } from 'react-dom/client';
 
const MadlibsComponent = () => {
  const [formData, setFormData] = React.useState({
    adjective: '', drink: '', place: '', subject: '', verb: '', plural: ''
  });
  const [story, setStory] = React.useState({});
 
  const sendStuff = async (event) => {
    event.preventDefault();
    const response = await fetch('/madlibs', {
      method: 'POST',
      headers: {'Content-Type': 'application/json;charset=UTF-8'},
      body: JSON.stringify(formData),
    });
    setStory(await response.json());
  };
 
  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  return (
    <div>
      <h2>BERTIN'S SEMESTER</h2>
      <h4>Input Your Word Choices:</h4>
      <form onSubmit={sendStuff}>
        Adjective <input name="adjective" value={formData.adjective} onChange={handleChange} /><br />
        Drink <input name="drink" value={formData.drink} onChange={handleChange} /><br />
        Place <input name="place" value={formData.place} onChange={handleChange} /><br />
        School Subject <input name="subject" value={formData.subject} onChange={handleChange} /><br />
        Verb ending in -ing <input name="verb" value={formData.verb} onChange={handleChange} /><br />
        Plural Noun <input name="plural" value={formData.plural} onChange={handleChange} /><br /><br />
        <input type="submit" value="See the Results!" />
      </form>
      <p>{story.p1}</p>
      <p>{story.p2}</p>
      <p>{story.p3}</p>
    </div>
  );
};
 
createRoot(document.getElementById('madlibs')).render(<MadlibsComponent />);