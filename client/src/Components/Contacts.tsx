import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { Dispatch } from "redux";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { ContactActionTypes, SET_CONTACTS } from "../store/contactActions";

const Contacts: React.FC = () => {
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const dispatch = useDispatch<Dispatch<ContactActionTypes>>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("https://contact-meeno.onrender.com/api/contacts");
      dispatch({ type: SET_CONTACTS, payload: response.data });
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const createContact = async () => {
    try {
      await axios.post("https://contact-meeno.onrender.com/api/contacts", {
        firstName,
        lastName,
        status,
      });
      setFirstName("");
      setLastName("");
      setStatus("active");
      fetchContacts();
      closeModal();
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  };

  const editContact = (contact: Contact) => {
    setEditingContact(contact);
    openModal();
  };

  const updateContact = async () => {
    if (editingContact) {
      try {
        await axios.put(
          `https://contact-meeno.onrender.com/api/contacts/${editingContact._id}`,
          {
            firstName,
            lastName,
            status,
          }
        );
        setFirstName("");
        setLastName("");
        setStatus("active");
        setEditingContact(null);
        fetchContacts();
        closeModal();
      } catch (error) {
        console.error("Error updating contact:", error);
      }
    }
  };

  const deleteContact = async (id: string) => {
    try {
      console.log("Deleting contact with ID:", id);
      await axios.delete(`https://contact-meeno.onrender.com/api/contacts/${id}`);
      console.log("Contact deleted successfully");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const openModal = () => {
    setShowCreateForm(true);
  };

  const closeModal = () => {
    setShowCreateForm(false);
    setEditingContact(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Contact Page</h2>

      <div className="mb-8 text-center">
        <div className="flex justify-end mb-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={openModal}
          >
            Create Contact
          </button>
        </div>
        <Modal
          isOpen={showCreateForm}
          onRequestClose={closeModal}
          contentLabel="Create Contact Modal"
          className="modal-content"
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">
              {editingContact ? "Edit Contact" : "Create Contact"}
            </h2>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="p-2 border rounded"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="p-2 border rounded"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <select
                className="p-2 border rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={editingContact ? updateContact : createContact}
                >
                  {editingContact ? "Update" : "Save"}
                </button>
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contacts.length === 0 ? (
          <p className="text-center">No Contacts Found.</p>
        ) : (
          contacts.map((contact: Contact) => (
            <div
              key={contact._id}
              className="bg-white rounded shadow-md p-4 transform transition-transform hover:shadow-lg hover:scale-105"
              >
              <p className="text-lg font-semibold">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-gray-600">{contact.status}</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => editContact(contact)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => deleteContact(contact._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Contacts;
