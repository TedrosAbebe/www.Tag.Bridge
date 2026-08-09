import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, InputFile
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters, ConversationHandler
)

# ===== CONFIG =====
BOT_TOKEN = "8983227461:AAEFFLkC0RIb1uMndPJdAE2YGcB91vXldxc"
ADMIN_CHAT_ID = 867253752

BOOKS = {
    "forex": {
        "name": "📈 Forex Trading Book",
        "name_am": "የፎሬክስ ትሬዲንግ መጽሃፍ",
        "price": 350,
        "file_id": "BQACAgQAAxkBAAMLangz4xjLPNengTBmxx5-_K6nghQAAmYfAAL5I8FTsme_7Fudlmc9BA",
        "password": "ይህበታግብሪጅየተዘጋጀመጽሃፍነው"
    },
    "crypto": {
        "name": "₿ Crypto Trading Book",
        "name_am": "የክሪፕቶ ትሬዲንግ መጽሃፍ",
        "price": 400,
        "file_id": "BQACAgQAAxkBAAMMangz9fs8krkBAAFvdGMpx9_YsgwyAAJnHwAC-SPBUyItvMcRr4cEPQQ",
        "password": "494841"
    },
    "bundle": {
        "name": "📚 Bundle (Forex + Crypto)",
        "name_am": "ሁለቱም መጽሃፍት",
        "price": 500,
        "file_id": None,  # sends both
        "password": None
    }
}

PAYMENT = {
    "cbe": {
        "name": "CBE Birr (Commercial Bank)",
        "account": "100200450705",
        "holder": "Tedros"
    },
    "telebirr": {
        "name": "Telebirr",
        "account": "0991856292",
        "holder": "Tedros"
    }
}

# Conversation states
SELECT_BOOK, SELECT_PAYMENT, WAITING_RECEIPT = range(3)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== /start =====
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📈 Forex — 350 ብር", callback_data="book_forex")],
        [InlineKeyboardButton("₿ Crypto — 400 ብር", callback_data="book_crypto")],
        [InlineKeyboardButton("📚 Bundle (ሁለቱም) — 500 ብር", callback_data="book_bundle")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "👋 እንኳን ወደ ታግ ብሪጅ መጡ!\n\n"
        "📚 የትኛውን መጽሃፍ መግዛት ይፈልጋሉ?",
        reply_markup=reply_markup
    )
    return SELECT_BOOK

# ===== Book selected =====
async def book_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    book_key = query.data.replace("book_", "")
    book = BOOKS[book_key]
    context.user_data["book"] = book_key

    keyboard = [
        [InlineKeyboardButton("🏦 CBE Birr", callback_data="pay_cbe")],
        [InlineKeyboardButton("📱 Telebirr", callback_data="pay_telebirr")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text(
        f"✅ መርጠዋል: {book['name']}\n"
        f"💰 ዋጋ: {book['price']} ብር\n\n"
        f"እንዴት መክፈል ይፈልጋሉ?",
        reply_markup=reply_markup
    )
    return SELECT_PAYMENT

# ===== Payment selected =====
async def payment_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    pay_key = query.data.replace("pay_", "")
    pay = PAYMENT[pay_key]
    book_key = context.user_data.get("book")
    book = BOOKS[book_key]

    context.user_data["payment"] = pay_key

    await query.edit_message_text(
        f"💳 {pay['name']}\n\n"
        f"👤 የአካውንት ስም: <b>{pay['holder']}</b>\n"
        f"🔢 አካውንት ቁጥር: <b>{pay['account']}</b>\n"
        f"💰 መጠን: <b>{book['price']} ብር</b>\n\n"
        f"ክፍያ ከፈጸሙ በኋላ <b>የደረሰኝ ፎቶ</b> ይላኩ 📸",
        parse_mode="HTML"
    )
    return WAITING_RECEIPT

# ===== Receipt received =====
async def receipt_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    book_key = context.user_data.get("book")
    pay_key = context.user_data.get("payment")

    if not book_key:
        await update.message.reply_text("እባክዎ /start ብለው እንደገና ይጀምሩ።")
        return ConversationHandler.END

    book = BOOKS[book_key]
    pay = PAYMENT[pay_key]

    # Store user info for admin approval
    context.user_data["user_id"] = user.id
    context.user_data["username"] = user.username or user.first_name

    # Forward receipt to admin with approve/reject buttons
    keyboard = [
        [
            InlineKeyboardButton("✅ Approve", callback_data=f"approve_{user.id}_{book_key}"),
            InlineKeyboardButton("❌ Reject", callback_data=f"reject_{user.id}")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    caption = (
        f"🔔 <b>New Order!</b>\n"
        f"━━━━━━━━━━━━━━\n"
        f"👤 Customer: @{user.username or user.first_name} (ID: {user.id})\n"
        f"📚 Book: {book['name']}\n"
        f"💰 Price: {book['price']} ብር\n"
        f"💳 Payment: {pay['name']}\n"
        f"━━━━━━━━━━━━━━\n"
        f"Approve ወይስ Reject?"
    )

    # Forward photo/document to admin
    if update.message.photo:
        await context.bot.send_photo(
            chat_id=ADMIN_CHAT_ID,
            photo=update.message.photo[-1].file_id,
            caption=caption,
            parse_mode="HTML",
            reply_markup=reply_markup
        )
    elif update.message.document:
        await context.bot.send_document(
            chat_id=ADMIN_CHAT_ID,
            document=update.message.document.file_id,
            caption=caption,
            parse_mode="HTML",
            reply_markup=reply_markup
        )
    else:
        await update.message.reply_text("❌ እባክዎ የደረሰኝ <b>ፎቶ</b> ይላኩ።", parse_mode="HTML")
        return WAITING_RECEIPT

    await update.message.reply_text(
        "✅ ደረሰኝዎ ደረሰን!\n\n"
        "⏳ እያረጋገጥን ነው — ከ 1-5 ደቂቃ ውስጥ መጽሃፍዎ ይደርስዎታል። 📚"
    )
    return ConversationHandler.END

# ===== Admin Approve =====
async def admin_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.from_user.id != ADMIN_CHAT_ID:
        await query.answer("❌ እርስዎ admin አይደሉም!", show_alert=True)
        return

    data = query.data

    if data.startswith("approve_"):
        parts = data.split("_")
        customer_id = int(parts[1])
        book_key = parts[2]
        book = BOOKS[book_key]

        # Send PDF(s) to customer
        if book_key == "bundle":
            # Send both PDFs
            for bk in ["forex", "crypto"]:
                b = BOOKS[bk]
                await context.bot.send_document(
                    chat_id=customer_id,
                    document=b["file_id"],
                    caption=(
                        f"🎉 እንኳን ደስ አለዎ! ይህ <b>{b['name_am']}</b> ነው።\n\n"
                        f"🔑 Password: <code>{b['password']}</code>\n\n"
                        f"ታግ ብሪጅን ስለመረጡ እናመሰግናለን! 🙏"
                    ),
                    parse_mode="HTML"
                )
        else:
            await context.bot.send_document(
                chat_id=customer_id,
                document=book["file_id"],
                caption=(
                    f"🎉 እንኳን ደስ አለዎ! ይህ <b>{book['name_am']}</b> ነው።\n\n"
                    f"🔑 Password: <code>{book['password']}</code>\n\n"
                    f"ታግ ብሪጅን ስለመረጡ እናመሰግናለን! 🙏"
                ),
                parse_mode="HTML"
            )

        await query.edit_message_caption(
            caption=query.message.caption + "\n\n✅ <b>Approved! PDF sent.</b>",
            parse_mode="HTML"
        )

    elif data.startswith("reject_"):
        customer_id = int(data.split("_")[1])
        await context.bot.send_message(
            chat_id=customer_id,
            text=(
                "❌ ክፍያዎ አልተረጋገጠም።\n\n"
                "ችግር ካለ እባክዎ እንደገና /start ብለው ይሞክሩ "
                "ወይም @tagbridge123 ያናግሩ።"
            )
        )
        await query.edit_message_caption(
            caption=query.message.caption + "\n\n❌ <b>Rejected.</b>",
            parse_mode="HTML"
        )

# ===== Cancel =====
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("ተሰርዟል። እንደገና ለመጀመር /start ይላኩ።")
    return ConversationHandler.END

# ===== MAIN =====
def main():
    app = Application.builder().token(BOT_TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            SELECT_BOOK: [CallbackQueryHandler(book_selected, pattern="^book_")],
            SELECT_PAYMENT: [CallbackQueryHandler(payment_selected, pattern="^pay_")],
            WAITING_RECEIPT: [
                MessageHandler(filters.PHOTO | filters.Document.PDF, receipt_received)
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    app.add_handler(conv_handler)
    app.add_handler(CallbackQueryHandler(admin_callback, pattern="^(approve|reject)_"))

    print("✅ Tag Bridge Bot is running...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
