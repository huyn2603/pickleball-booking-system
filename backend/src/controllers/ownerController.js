const Owner = require('../models/Owner');

function allowed(req, res) {
  if (!['Owner', 'Admin'].includes(req.user?.role)) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý dữ liệu Owner.' });
    return false;
  }
  return true;
}

function id(value) { const result = Number(value); return Number.isInteger(result) && result > 0 ? result : null; }
function bool(value) { return value === false || value === 0 ? 0 : 1; }
function nullableNumber(value) { return value === '' || value == null ? null : Number(value); }

function pricePayload(body) {
  return {
    branchId: nullableNumber(body.branchId), courtId: nullableNumber(body.courtId), name: String(body.name || '').trim(),
    dayOfWeek: nullableNumber(body.dayOfWeek), startTime: body.startTime, endTime: body.endTime,
    pricePerSlot: Number(body.pricePerSlot), priority: Number(body.priority || 100), isActive: bool(body.isActive),
  };
}

function promotionPayload(body) {
  return {
    code: String(body.code || '').trim().toUpperCase(), name: String(body.name || '').trim(), description: body.description || null,
    discountType: body.discountType || 'percentage', discountValue: Number(body.discountValue),
    maxDiscountAmount: nullableNumber(body.maxDiscountAmount), minOrderAmount: Number(body.minOrderAmount || 0),
    startDate: body.startDate, endDate: body.endDate, usageLimit: nullableNumber(body.usageLimit), isActive: bool(body.isActive),
  };
}

async function workspace(req, res) {
  try { if (!allowed(req, res)) return; res.json({ success: true, ...(await Owner.getWorkspace(req.query.date || new Date().toISOString().slice(0, 10))) }); }
  catch (error) { console.error(error); res.status(500).json({ success: false, message: 'Không thể tải dữ liệu quản lý Owner.' }); }
}

async function schedule(req, res) {
  try {
    if (!allowed(req, res)) return;
    if (!id(req.params.id) || !/^\d{2}:\d{2}$/.test(req.body.openTime) || !/^\d{2}:\d{2}$/.test(req.body.closeTime) || req.body.openTime >= req.body.closeTime) return res.status(400).json({ success: false, message: 'Giờ hoạt động không hợp lệ.' });
    await Owner.updateSchedule(id(req.params.id), req.body); res.json({ success: true, message: 'Đã cập nhật lịch hoạt động.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Không thể cập nhật lịch hoạt động.' }); }
}

async function price(req, res) {
  try { if (!allowed(req, res)) return; const data=pricePayload(req.body); if (!data.name || !data.startTime || !data.endTime || data.pricePerSlot < 0) return res.status(400).json({success:false,message:'Thông tin bảng giá không hợp lệ.'}); req.params.id ? await Owner.updatePriceRule(id(req.params.id), data) : await Owner.createPriceRule(data); res.json({success:true,message:'Đã lưu bảng giá.'}); }
  catch(error){ console.error(error); res.status(500).json({success:false,message:'Không thể lưu bảng giá.'}); }
}
async function removePrice(req,res){ try{if(!allowed(req,res))return;await Owner.deletePriceRule(id(req.params.id));res.json({success:true});}catch(error){res.status(500).json({success:false,message:'Không thể xóa bảng giá.'});} }
async function promotion(req,res){ try{if(!allowed(req,res))return;const data=promotionPayload(req.body);if(!data.name||(!req.params.id&&!data.code)||!data.startDate||!data.endDate)return res.status(400).json({success:false,message:'Thông tin khuyến mãi không hợp lệ.'});req.params.id?await Owner.updatePromotion(id(req.params.id),data):await Owner.createPromotion(data);res.json({success:true,message:'Đã lưu khuyến mãi.'});}catch(error){console.error(error);res.status(500).json({success:false,message:'Không thể lưu khuyến mãi.'});} }
async function removePromotion(req,res){try{if(!allowed(req,res))return;await Owner.deletePromotion(id(req.params.id));res.json({success:true});}catch(error){res.status(500).json({success:false,message:'Không thể xóa khuyến mãi đã được sử dụng.'});}}
async function feedback(req,res){try{if(!allowed(req,res))return;await Owner.updateFeedback(id(req.params.id),req.body.status||'resolved',req.user.id);res.json({success:true,message:'Đã cập nhật phản hồi.'});}catch(error){res.status(500).json({success:false,message:'Không thể cập nhật phản hồi.'});}}
async function reschedule(req,res){try{if(!allowed(req,res))return;const {bookingDate,startTime,endTime}=req.body;if(!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)||!/^\d{2}:\d{2}$/.test(startTime)||!/^\d{2}:\d{2}$/.test(endTime)||startTime>=endTime)return res.status(400).json({success:false,message:'Ngày hoặc khung giờ không hợp lệ.'});await Owner.rescheduleBooking(id(req.params.id),bookingDate,startTime,endTime);res.json({success:true,message:'Đã chỉnh sửa lịch đặt sân.'});}catch(error){res.status(400).json({success:false,message:error.message||'Không thể chỉnh sửa đơn đặt sân.'});}}
function servicePayload(body){return{code:String(body.code||'').trim().toUpperCase(),name:String(body.name||'').trim(),serviceType:body.serviceType||'rental',unitPrice:Number(body.unitPrice||0),stockQuantity:Number(body.stockQuantity||0),status:body.status||'active'};}
async function service(req,res){try{if(!allowed(req,res))return;const data=servicePayload(req.body);if(!data.name||(!req.params.id&&!data.code)||data.unitPrice<0||data.stockQuantity<0)return res.status(400).json({success:false,message:'Thông tin dịch vụ không hợp lệ.'});req.params.id?await Owner.updateService(id(req.params.id),data):await Owner.createService(data);res.json({success:true,message:'Đã lưu dịch vụ.'});}catch(error){console.error(error);res.status(500).json({success:false,message:'Không thể lưu dịch vụ.'});}}
async function removeService(req,res){try{if(!allowed(req,res))return;await Owner.deleteService(id(req.params.id));res.json({success:true,message:'Đã xóa dịch vụ.'});}catch(error){res.status(400).json({success:false,message:'Không thể xóa dịch vụ đã phát sinh giao dịch.'});}}

module.exports={feedback,price,promotion,removePrice,removePromotion,removeService,reschedule,schedule,service,workspace};
