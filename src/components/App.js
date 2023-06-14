import { useEffect, useState } from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import DeleteCardPopup from "./DeleteCardPopop";


function App() {
  const [cards, setCards] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [selectedCard, setSelectedCard] = useState({});
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [submitTextButton, setSubmitTextButtton] = useState("");
  const [errorMessegeInput, setErrorMessegeInput] = useState({});
  const [buttonStateForm, setButtonStateForm] = useState(true);
  const [isDeleteCardPopupOpen, setIsDeleteCardPopupOpen] = useState(false);
  const [dataCardDelete, setDataCardDelete] = useState({});

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userInfo, cards]) => {
        setCurrentUser(userInfo)
        setCards(cards)
      })
      .catch(err => console.log(`Ошибка ${err}`));
  }, [])
  useEffect(() => {
    if (isEditProfilePopupOpen) {
      setButtonStateForm(false)
    } else {
      setErrorMessegeInput({})
      setButtonStateForm(true)
    }

  }, [isEditProfilePopupOpen, isAddPlacePopupOpen, isEditAvatarPopupOpen])

  function handleCardClick(card) {
    setSelectedCard(card);
  }
  function handleEditProfileClick() {
    setSubmitTextButtton("Сохранить")
    setIsEditProfilePopupOpen((editProfilePopup) => !editProfilePopup)
  }
  function handleAddPlaceClick() {
    setSubmitTextButtton("Создать")
    setIsAddPlacePopupOpen((addPlacePopup) => !addPlacePopup)
  }
  function handleEditAvatarClick() {
    setSubmitTextButtton("Сохранить")
    setIsEditAvatarPopupOpen((editAvatarPopup) => !editAvatarPopup)
  }
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false)
    setIsAddPlacePopupOpen(false)
    setIsEditAvatarPopupOpen(false)
    setIsDeleteCardPopupOpen(false)
    setSelectedCard({})
  }
  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    if (!isLiked) {
      api.addLike(card._id)
        .then(newCard => setCards((state) => state.map((userCard) => userCard._id === card._id ? newCard : userCard)))
        .catch(err => console.log(`Ошибка ${err}`))
    } else {
      api.removeLike(card._id)
        .then(newCard => setCards((state) => state.map((userCard) => userCard._id === card._id ? newCard : userCard)))
        .catch(err => console.log(`Ошибка ${err}`))
    }
  }
  function handleCardDelete(card) {
    setSubmitTextButtton("Да")
    setIsDeleteCardPopupOpen((deletePopup) => !deletePopup)
    setDataCardDelete(card);
  }
  function submitDeleteCard() {
    setSubmitTextButtton("Удаление...")
    api.deleteCard(dataCardDelete._id)
      .then(() => {
        setCards((item) => item.filter((elem) => elem._id !== dataCardDelete._id))
        closeAllPopups();
      })
      .catch(err => console.log(`Ошибка ${err}`))
      .finally(() => setSubmitTextButtton("Да"))
  }
  function handleUpdateUser(userInfo) {
    setSubmitTextButtton("Сохранение...")
    api.setProfileUser(userInfo.name, userInfo.about)
      .then(res => {
        setCurrentUser({ ...currentUser, name: res.name, about: res.about })
        closeAllPopups()
      })
      .catch(err => console.log(`Ошибка ${err}`))
      .finally(() => setSubmitTextButtton("Сохранить"))
  }
  function handleUpdateAvatar(avatar) {
    setSubmitTextButtton("Сохранение...")
    api.setAvatarUser(avatar)
      .then(res => {
        setCurrentUser({ ...currentUser, avatar: res.avatar })
        closeAllPopups()
      })
      .catch(err => console.log(`Ошибка ${err}`))
      .finally(() => setSubmitTextButtton("Сохранить"))
  }
  function handleAddPlaceSubmit(newCard) {
    setSubmitTextButtton("Создание...")
    api.addNewCard(newCard.name, newCard.link)
      .then(res => {
        setCards([res, ...cards])
        closeAllPopups();
      })
      .catch(err => console.log(`Ошибка ${err}`))
      .finally(() => setSubmitTextButtton("Создать"))
  }
  function validationForms(form) {
    if (form.currentTarget.checkValidity()) {
      setButtonStateForm(false)
      setErrorMessegeInput({ ...errorMessegeInput, [form.target.name]: "" })
    } else {
      setButtonStateForm(true)
      setErrorMessegeInput({ ...errorMessegeInput, [form.target.name]: form.target.validationMessage })
    }
  }

  return (
    <div className="wrapper">
      <div className="container">
        <CurrentUserContext.Provider value={currentUser}>
          <Header />
          <Main onCardDelete={handleCardDelete} cards={cards} onCardLike={handleCardLike} onCardClick={handleCardClick} onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick} />
          <Footer />
          <EditProfilePopup errorMessegeInput={errorMessegeInput} buttonStateForm={buttonStateForm} onValidation={validationForms} textLoadingSubmit={submitTextButton} onUpdateUser={handleUpdateUser} isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} />
          <EditAvatarPopup errorMessegeInput={errorMessegeInput} buttonStateForm={buttonStateForm} onValidation={validationForms} textLoadingSubmit={submitTextButton} onUpdateAvatar={handleUpdateAvatar} isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} />
          <AddPlacePopup errorMessegeInput={errorMessegeInput} buttonStateForm={buttonStateForm} onValidation={validationForms} textLoadingSubmit={submitTextButton} cards={cards} onAddPlace={handleAddPlaceSubmit} isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} />
          <ImagePopup onClose={closeAllPopups} name={"img"} card={selectedCard} />
          <DeleteCardPopup onCardDelete={handleCardDelete} onClose={closeAllPopups} textLoadingSubmit={submitTextButton} isOpen={isDeleteCardPopupOpen} onSubmit={submitDeleteCard} card={dataCardDelete} />
        </CurrentUserContext.Provider>
      </div>
    </div>
  );
}

export default App;
