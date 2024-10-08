import React, { useContext, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import UserDetailContext from "../../context/UserDetailContext.js";
import { BuyTicketFundraising } from "../../utils/api.js";

const LotteryFundraisingTicketPurchase = ({ opened, setOpened, lotteryId, email, ticketPrice }) => {
  const [ticketNumber, setTicketNumber] = useState(1); // Default ticket number
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State to control button lock
  const {
    userDetails: { token, balance },
    setUserDetails,
  } = useContext(UserDetailContext);

  // Calculate total price based on the number of tickets
  const totalPrice = ticketNumber * ticketPrice;

  useEffect(() => {
    if (opened) {
      setIsButtonDisabled(false); // Reset button state to enabled when the dialog opens
    }
  }, [opened]); // Re-run effect whenever the dialog's open state changes

  const handleLotteryTicketPurchaseSuccess = () => {
    toast.success("You have purchased your ticket successfully", {
      position: "bottom-right",
    });

    setUserDetails((prev) => ({
      ...prev,
      balance: prev.balance - totalPrice, // Deduct the total price from user balance
      ticketPurchases: [
        ...(prev.ticketPurchases || []), // Ensure prev.ticketPurchases is an array
        {
          id: lotteryId,
          tickets: ticketNumber,
          totalPrice: totalPrice,
        },
      ],
    }));

    setTicketNumber(1); // Reset ticket number to 1 after purchase
    setIsButtonDisabled(false); // Unlock button after success
  };

  // Mutation for booking tickets
  const { mutate } = useMutation(
    () =>
      BuyTicketFundraising(
        {
          ticketNumber,
          lotteryId,
          email,
          totalPrice,
        },
        token
      ),
    {
      onSuccess: () => handleLotteryTicketPurchaseSuccess(),
      onError: ({ response }) => {
        toast.error(response.data.message);
        setIsButtonDisabled(false); // Unlock button if there is an error
      },
      onSettled: () => setOpened(false),
    }
  );

  const handleTicketNumberChange = (e) => {
    const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1)); // Limit between 1 and 10
    setTicketNumber(value);
  };

  const handleBuyTicketsClick = () => {
    setIsButtonDisabled(true); // Lock the button when clicked
    mutate(); // Execute the mutation
  };

  return (
    <Dialog
      open={opened}
      onClose={() => setOpened(false)}
      aria-labelledby="dialog-title"
      maxWidth="sm"
      fullWidth
      sx={{ 
        margin: "auto"
       }} // Correctly set the width to 90%

    >
      <DialogTitle
        id="dialog-title"
        className="dialogTitle"
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Purchase Tickets
        {/* Close Button */}
        <IconButton onClick={() => setOpened(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="dialogContent">
        <div className="flexColCenter" style={{ gap: "1rem", minWidth: "300px" }}>
          <Typography variant="h6">Your Balance: {balance} USD</Typography>
          <TextField
            className="responsiveTextField"
            label="Number of Tickets (Max 10 per purchase)"
            type="number"
            value={ticketNumber}
            onChange={handleTicketNumberChange}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
            sx={{ width: '84%' }} // Correctly set the width to 90%
          />
          <Typography variant="h6">Total Price: {totalPrice} USD</Typography>
          <button
            className="button button-blue"
            disabled={isButtonDisabled || totalPrice > balance} // Disable the button based on the state
            onClick={handleBuyTicketsClick} // Use the function to handle the click and disable the button
          >
            Buy Tickets
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LotteryFundraisingTicketPurchase;
