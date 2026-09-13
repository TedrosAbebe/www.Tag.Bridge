import logging
import urllib.request
import urllib.parse
import json
import random
import string
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters, ConversationHandler
)

# ===== CONFIG =====
BOT_TOKEN = "8983227461:AAEFFLkC0RIb1uMndPJdAE2YGcB91vXldxc"
ADMIN_CHAT_ID = 867253752
SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3pGZBdEcvJHEMC5ANAV2w9V60GMa0hwa_5e8WAhfsgLL-jsuApZ5ALRcCs5uxJa0wgQ/exec"
SITE_URL = "https://www-tag-bridge.vercel.app"

BOOKS = {
    "forex": {
        "name": "📈 Forex Trading Book",
        "name_am": "የፎሬክስ ትሬዲንግ መጽሃፍ",
        "price": 350,
        "file_id": "BQACAgQAAxkBAAMLangz4xjLPNengTBmxx5-_K6nghQAAmYfAAL5I8FTsme_7Fudlmc9BA",
    },
    "crypto": {
        "name": "₿ Crypto Trading Book",
        "name_am": "የክሪፕቶ ትሬዲንግ መጽሃፍ",
        "price": 400,
        "file_id": "BQACAgQAAxkBAAMMangz9fs8krkBAAFvdGMpx9_YsgwyAAJnHwAC-SPBUyItvMcRr4cEPQQ",
    },
    "bundle": {
        "name": "📚 Bundle (Forex + Crypto)",
        "name_am": "ሁለቱም መጽሃፍት",
        "price": 500,
        "file_id": None,
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

SELECT_BOOK, SELECT_PAYMENT, WAITING_RECEIPT = range(3)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ===== GENERATE PASSWORD VIA APPS SCRIPT =====
def generate_password(book_key, customer_name):
    try:
        params = urllib.parse.urlencode({
            'action': 'create',
            'book': book_key,
            'customer': customer_name
        })
        url = SCRIPT_URL + '?' + params
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
            if data.get('success'):
                return data.get('password')
    except Exception as e:
        logger.error(f"Password generation error: {e}")
    return None


# ===== /start =====
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📈 Forex — 350 ብር", callback_data="book_forex")],
        [InlineKeyboardButton("₿ Crypto — 400 ብር", callback_data="book_crypto")],
        [InlineKeyboardButton("📚 Bundle (ሁለቱም) — 500 ብር", callback_data="book_bundle")],
    ]
    await update.message.reply_text(
        "👋 እንኳን ወደ ታግ ብሪጅ መጡ!\n\n"
        "📚 የትኛውን መጽሃፍ መግዛት ይፈልጋሉ?",
        reply_markup=InlineKeyboardMarkup(keyboard)
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
    await query.edit_message_text(
        f"✅ መርጠዋል: {book['name']}\n"
        f"💰 ዋጋ: {book['price']} ብር\n\n"
        f"እንዴት መክፈል ይፈልጋሉ?",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
    return SELECT_PAYMENT


# ===== Payment selected =====
async def payment_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    pay_key = query.data.replace("pay_", "")
    pay = PAYMENT[pay_key]
    book = BOOKS[context.user_data.get("book")]
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
    customer_name = user.username or user.first_name

    keyboard = [[
        InlineKeyboardButton("✅ Approve", callback_data=f"approve_{user.id}_{book_key}_{customer_name}"),
        InlineKeyboardButton("❌ Reject", callback_data=f"reject_{user.id}")
    ]]

    caption = (
        f"🔔 <b>New Order!</b>\n"
        f"━━━━━━━━━━━━━━\n"
        f"👤 Customer: @{customer_name} (ID: {user.id})\n"
        f"📚 Book: {book['name']}\n"
        f"💰 Price: {book['price']} ብር\n"
        f"💳 Payment: {pay['name']}\n"
        f"━━━━━━━━━━━━━━\n"
        f"Approve ወይስ Reject?"
    )

    if update.message.photo:
        await context.bot.send_photo(
            chat_id=ADMIN_CHAT_ID,
            photo=update.message.photo[-1].file_id,
            caption=caption,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    elif update.message.document:
        await context.bot.send_document(
            chat_id=ADMIN_CHAT_ID,
            document=update.message.document.file_id,
            caption=caption,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    else:
        await update.message.reply_text("❌ እባክዎ የደረሰኝ <b>ፎቶ</b> ይላኩ።", parse_mode="HTML")
        return WAITING_RECEIPT

    await update.message.reply_text(
        "✅ ደረሰኝዎ ደረሰን!\n\n"
        "⏳ እያረጋገጥን ነው — ከ 1-5 ደቂቃ ውስጥ password ይደርስዎታል። 🔐"
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
        parts = data.split("_", 3)
        customer_id = int(parts[1])
        book_key = parts[2]
        customer_name = parts[3] if len(parts) > 3 else "customer"
        book = BOOKS[book_key]

        # Generate unique password via Apps Script
        await query.edit_message_caption(
            caption=query.message.caption + "\n\n⏳ Password እየፈጠረ ነው...",
            parse_mode="HTML"
        )

        if book_key == "bundle":
            # Generate two passwords for bundle
            pw_forex = generate_password("forex", customer_name)
            pw_crypto = generate_password("crypto", customer_name)

            if pw_forex and pw_crypto:
                msg = (
                    f"🎉 <b>እንኳን ደስ አለዎ!</b>\n\n"
                    f"📚 የፎሬክስ + ክሪፕቶ ጥቅል ተዘጋጅቷል!\n\n"
                    f"━━━━━━━━━━━━━━\n"
                    f"📈 <b>Forex Password:</b>\n"
                    f"<code>{pw_forex}</code>\n\n"
                    f"₿ <b>Crypto Password:</b>\n"
                    f"<code>{pw_crypto}</code>\n"
                    f"━━━━━━━━━━━━━━\n\n"
                    f"🔗 ለማንበብ ይህን link ይጠቀሙ:\n"
                    f"{SITE_URL}/read.html\n\n"
                    f"⚠️ Password ን ለሌሎች አያካፍሉ!\n"
                    f"ታግ ብሪጅን ስለመረጡ እናመሰግናለን! 🙏"
                )
                await context.bot.send_message(
                    chat_id=customer_id, text=msg, parse_mode="HTML"
                )
                await query.edit_message_caption(
                    caption=query.message.caption + f"\n\n✅ <b>Approved!</b>\n🔑 {pw_forex} / {pw_crypto}",
                    parse_mode="HTML"
                )
            else:
                await query.edit_message_caption(
                    caption=query.message.caption + "\n\n❌ Password generation failed!",
                    parse_mode="HTML"
                )
        else:
            pw = generate_password(book_key, customer_name)
            if pw:
                msg = (
                    f"🎉 <b>እንኳን ደስ አለዎ!</b>\n\n"
                    f"📚 {book['name_am']} ዝግጁ ነው!\n\n"
                    f"━━━━━━━━━━━━━━\n"
                    f"🔑 <b>Password:</b>\n"
                    f"<code>{pw}</code>\n"
                    f"━━━━━━━━━━━━━━\n\n"
                    f"🔗 ለማንበብ ይህን link ይጠቀሙ:\n"
                    f"{SITE_URL}/read.html\n\n"
                    f"⚠️ Password ን ለሌሎች አያካፍሉ!\n"
                    f"ታግ ብሪጅን ስለመረጡ እናመሰግናለን! 🙏"
                )
                await context.bot.send_message(
                    chat_id=customer_id, text=msg, parse_mode="HTML"
                )
                await query.edit_message_caption(
                    caption=query.message.caption + f"\n\n✅ <b>Approved!</b>\n🔑 Password: {pw}",
                    parse_mode="HTML"
                )
            else:
                await query.edit_message_caption(
                    caption=query.message.caption + "\n\n❌ Password generation failed! Manual send needed.",
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
