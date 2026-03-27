package com.nexorcrm.backend.dto;

import java.time.LocalTime;

public class ShiftResponse {

    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer earlyCheckinBufferMinutes;
    private Integer lateCheckinBufferMinutes;
    private Integer breakAllowedMinutes;
    private Integer breakGraceMinutes;
    private Integer lunchAllowedMinutes;
    private Integer lunchGraceMinutes;
    private Boolean isNightShift;
    private Integer minWorkMinutes;
    private Boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getEarlyCheckinBufferMinutes() { return earlyCheckinBufferMinutes; }
    public void setEarlyCheckinBufferMinutes(Integer earlyCheckinBufferMinutes) { this.earlyCheckinBufferMinutes = earlyCheckinBufferMinutes; }

    public Integer getLateCheckinBufferMinutes() { return lateCheckinBufferMinutes; }
    public void setLateCheckinBufferMinutes(Integer lateCheckinBufferMinutes) { this.lateCheckinBufferMinutes = lateCheckinBufferMinutes; }

    public Integer getBreakAllowedMinutes() { return breakAllowedMinutes; }
    public void setBreakAllowedMinutes(Integer breakAllowedMinutes) { this.breakAllowedMinutes = breakAllowedMinutes; }

    public Integer getBreakGraceMinutes() { return breakGraceMinutes; }
    public void setBreakGraceMinutes(Integer breakGraceMinutes) { this.breakGraceMinutes = breakGraceMinutes; }

    public Integer getLunchAllowedMinutes() { return lunchAllowedMinutes; }
    public void setLunchAllowedMinutes(Integer lunchAllowedMinutes) { this.lunchAllowedMinutes = lunchAllowedMinutes; }

    public Integer getLunchGraceMinutes() { return lunchGraceMinutes; }
    public void setLunchGraceMinutes(Integer lunchGraceMinutes) { this.lunchGraceMinutes = lunchGraceMinutes; }

    public Boolean getIsNightShift() { return isNightShift; }
    public void setIsNightShift(Boolean isNightShift) { this.isNightShift = isNightShift; }

    public Integer getMinWorkMinutes() { return minWorkMinutes; }
    public void setMinWorkMinutes(Integer minWorkMinutes) { this.minWorkMinutes = minWorkMinutes; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
